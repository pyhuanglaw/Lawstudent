// AA_372 第 7 節（企劃線 da55ec2b；任務 AA372-S7-TAICHUNG-WEEKEND-1022）：週末回台中（presence trip「回台中」：以安第 4／8／12 週、沛珊單數週）也照 AA_350 T7a、S6——不需要瀏覽器。
//   BB 10-22 03:16 讀碼：DATE 的回台中婉拒只看寒暑假（kind home），前一天在臺北約那個週末的校外約會照常出發；當天手機的約整個關著（「回台中，不在臺北。」）。
//   1 當天（她在台中）：手機的約打開、只列 D26；答應的那一句以安照 T7a、沛珊新寫的那一句
//   2 前一天在臺北約那個週末：不是 D26 的地點擋掉（以安 S6、沛珊新寫，寒暑假也用這句）；D26 照約
//   3 方奕廷暑假上山（trip，不是回台中）照舊「……，不在臺北。」
// 修改前：第 1、2 項 FAIL。用法：node tests/aa372_s7_unit.js
require('./alison.js');   /* AA_380：企劃線的舊稿還寫「小語」，讀稿的時候照匯入工具換成 Alison */
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..'), GIT=process.env.SPEC_GIT_DIR||ROOT, SPEC_SHA='965815f5', SPEC_PATH='docs/story_planning/AA_372_法律系大一上_知道太早與重複_修正稿.md';
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:'?noriders'};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|NEEDED_MSGS|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|HOMETOWN_LINES|HV|DATE|DATE_DATA|DATE_LINES|CONFESS_LINES|TERMEND|TERMEND_LINES|VAC|VAC_DATA|FREE_TRIPS|TRIP|ENCOUNTERS|ENC_WALK|ENC|DORM_ROOM)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0},userData:{},add(){}});
global.CHAR={setExpr(){},build:()=>mkObj()};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+String(info).slice(0,600):'')); if(!ok) fails++; };
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/msg3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/romance3d.js',
  'src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js',
  'src/data/dorm_room_layout.js','src/story3d.js','src/classes3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
const D=k=>STORY.dayOfKey(k), wdOf=d=>CALENDAR.dateOf(d).wd%7;
let G=null, said=[], picks=[], opts=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
/* 選項：picks 的下一個（字串＝選項包含它；RegExp＝符合；數字＝第幾個）；找不到＝選第一個、不消耗 picks */
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(n){ G.money+=n; },setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },
  choose:async o=>{ const T=o.map(q=>q.t||q.text); opts.push(T); if(opts.length>80) throw new Error('選項一直重來（選的項目約不成？）：'+J(opts.slice(-3))); if(picks.length){ const w=picks[0]; if(typeof w==='number'){ picks.shift(); return w; } const k=T.findIndex(x=>w instanceof RegExp?w.test(x):x.includes(w)); if(k>=0){ picks.shift(); return k; } const g=o.findIndex(q=>(q.sub||[]).some(s=>w instanceof RegExp?w.test(s):s.includes(w))); if(g>=0) return g; /* INVITE-MENU-1030 分層：要選的名稱在某一類裡（選項的 sub）＝先選那一類，這個 pick 留給下一層 */ } return 0; }};
const fresh=(day,hour,flags)=>{ G={v:3,stage:'law',day,hour,zone:'dorm',weekday:wdOf(day),weather:'clear',energy:70,money:50000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,afternoonDone:true,classDone:true,introDone:true,metAn:true,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,contacts:{},invites:[],stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; picks=[]; opts=[]; GM.npc={}; if(STORY._fy) STORY._fy.reset(); return G; };
const S4={fam:30,trust:20,comf:15,npcRom:10,rom:0}, S5={fam:45,trust:30,comf:20,npcRom:35,rom:10}, S6={fam:60,trust:45,comf:40,npcRom:55,rom:30};
const know=(id,rel)=>{ SOCIAL.remember(id,'FIRST_MET',''); Object.assign(SOCIAL.rel(id),rel); G.contacts[id]=1; };
const J=x=>JSON.stringify(x), T=()=>said.map(s=>s.t), thread=id=>(G.msgs||[]).filter(m=>m.th==='p:'+id).map(m=>(m.from||'')+':'+m.text);
const DT=()=>typeof DATE!=='undefined'?DATE:{};
const D26=()=>DATE.loc('D26').name, label=d=>new RegExp('^(今天 |明天 )?'+CALENDAR.dateOf(d).m+'/'+CALENDAR.dateOf(d).d+'（');   /* 日期的選項：開頭是那一天（兩天一夜「2/6（五）～2/7（六）」不算 2/7）*/
/* 從手機約：INV.flow（手機）→ 第一層的選項；再選「去校外…」→ DATE.menu 的清單 → 選 D26 → 交通（第一個）→ 日期 → 時間 → 就這樣約 */
const phoneAsk=async(id,pk)=>{ said=[]; opts=[]; picks=pk||[]; let r=null, err=null; try{ r=await INV.flow(GM,id,null,false); }catch(e){ err=String(e&&e.message||e); } return {r,err,opts:opts.slice(),L:T().concat(err?['（例外）'+err]:[])}; };
(async()=>{
  let spec=''; try{ spec=cp.execSync('git show '+SPEC_SHA+':"'+SPEC_PATH+'"',{cwd:GIT,encoding:'utf8',maxBuffer:8<<20,stdio:['ignore','pipe','ignore']}); }catch(e){}
  const sec=(spec.split(/^## 7\./m)[1]||'');
  check('0. 讀得到稿（AA_372@'+SPEC_SHA+' 第 7 節）',/週末回台中/.test(sec));
  const yesPS=DT().T7A_YES&&DT().T7A_YES.classmate_peishan, noPS=DT().HOME_NO&&DT().HOME_NO.classmate_peishan;
  check('0. 沛珊兩句逐字（答應「'+yesPS+'」、婉拒 '+noPS+'）；以安照 T7a、S6',!!yesPS&&sec.includes('「'+yesPS+'」')&&!!noPS&&sec.includes(noPS)&&sec.includes('「'+DT().T7A_YES.heroine_01+'」')&&sec.includes(DT().HOME_NO.heroine_01),J([yesPS,noPS]));
  const P=(id,day)=>STORY.presence(id,{day,flags:{},stage:'law'});
  const anSat=D('2025-09-27'), psSat=D('2025-10-04');
  check('0. 前提：2025-09-27（六）以安、2025-10-04（六）沛珊 presence trip「回台中」',P('heroine_01',anSat).kind==='trip'&&P('heroine_01',anSat).away==='回台中'&&P('classmate_peishan',psSat).kind==='trip'&&wdOf(anSat)===6&&wdOf(psSat)===6);
  /* 1 當天 */
  for(const [id,sat] of [['heroine_01',anSat],['classmate_peishan',psSat]]){ fresh(sat,10,{['dating_'+id]:true}); know(id,S6);
    const why=INV.whyNot(G,id), only=DT().homeOnly&&DT().homeOnly(G,id);
    check('1. '+id+' 週末在台中（交往中）：手機的約打開（whyNot 空）、只列 D26',why===''&&J(only)===J(['D26']),J([why,only]));
    const c=await phoneAsk(id,['去校外…',D26(),0,label(sat+1),'09:00','就這樣約']); const t=c.r, yes=DT().T7A_YES[id];
    check('1. '+id+' 約成隔天 D26，答應的那一句「'+yes+'」',!!t&&t.ok&&J(t.locs)===J(['D26'])&&c.L.includes(yes),J([t&&{ok:t.ok,why:t.why,day:t.day},c.L.slice(-3)])); }
  /* 2 前一天在臺北約 */
  for(const [id,sat] of [['heroine_01',anSat],['classmate_peishan',psSat]]){ fresh(sat-1,20,{['dating_'+id]:true}); know(id,S6);
    const no=DATE.check(G,{who:id,locs:['D03'],day:sat,depart:9}), ok=DATE.check(G,{who:id,locs:['D26'],day:sat,depart:9});
    check('2. '+id+' 前一天（週五）在臺北約週六的淡水：擋掉'+DT().HOME_NO[id]+'；D26 照約',!no.ok&&String(no.why).includes(DT().HOME_NO[id].replace(/[「」]/g,''))&&ok.ok,J([no.ok,no.why,ok.ok,ok.why])); }
  /* 3 方奕廷 */
  { const G0={day:D('2026-07-15'),flags:{},stage:'law'}; const p=STORY.presence('npc_fangyt',G0); fresh(D('2026-07-15'),10,{});
    const w=p&&!p.here&&p.kind==='trip'?INV.whyNot(G,'npc_fangyt'):null;
    check('3. 不是回台中的 trip（方奕廷）照舊「……，不在臺北。」（沒有 trip 的日子就跳過）',w===null||/不在臺北。$/.test(w),J([p,w])); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); })().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
