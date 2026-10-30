// AA_350 T7a（企劃線 2e255e9a 第 9 節；任務 DATE-T7A-HOMETOWN-1021）：以安、芷若人在台中的時候，手機的「約」打開、只列 D26 臺中；她答應的那一句照 T7a。不需要瀏覽器。
// 用法：node tests/date_t7a_unit.js（稿用 git show 讀；證明修改前會失敗時，舊程式放在別的資料夾，SPEC_GIT_DIR＝這個 repo）
//   稿：「她人在台中時手機的『約』整個關著」→「打開，但只列 D26 臺中。她答應的那一句：以安「臺中？……好。我去車站接你。」；芷若「你要來臺中？……好。我帶你走。」」
//   這裡的做法（稿沒寫的，照最接近稿意的，列給 AA）：還沒到約校外的程度（第 5 階、交往中以外）＝沒有可以列的＝照舊關著；她回臺北以後的日子＝一起從臺北出發，照一般答應的那一句；
//   在臺北的時候約她回台中那幾天的 D26（AA_350 S6 的例外）照舊一般那一句（T7a 只管她人在台中時）。
require('./alison.js');   /* AA_380：企劃線的舊稿還寫「小語」，讀稿的時候照匯入工具換成 Alison */
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..'), GIT=process.env.SPEC_GIT_DIR||ROOT, SPEC_SHA='2e255e9a', SPEC_PATH='docs/story_planning/AA_350_回LAWWW_AA_QUESTIONS_1021_M_N十八題.md';
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
  // ===== 0. 句子照稿（AA_350@2e255e9a 第 9 節 T7a 逐字）、匯入白名單 =====
  let spec=''; try{ spec=cp.execSync('git show '+SPEC_SHA+':"'+SPEC_PATH+'"',{cwd:GIT,encoding:'utf8',maxBuffer:8<<20,stdio:['ignore','pipe','ignore']}); }catch(e){}
  const row=(spec.split('\n').find(l=>/^\|\s*T7a\s*\|/.test(l))||''), SP={};
  { const m1=/以安「([^」]*)」/.exec(row), m2=/芷若「([^」]*)」/.exec(row); if(m1) SP.heroine_01=m1[1]; if(m2) SP.heroine_02=m2[1]; }
  check('0. 讀得到稿 AA_350@'+SPEC_SHA+' 的 T7a：「打開，但只列 D26 臺中」＋以安、芷若答應的那一句',!!spec&&/打開，但只列 D26 臺中/.test(row)&&!!SP.heroine_01&&!!SP.heroine_02,J([row.slice(0,200),SP]));
  check('0. 以安、芷若答應的那一句逐字（DATE.T7A_YES；第三句是沛珊，AA_372 第 7 節 da55ec2b，tests/aa372_s7_unit.js 對稿）',!!DT().T7A_YES&&DT().T7A_YES.heroine_01===SP.heroine_01&&DT().T7A_YES.heroine_02===SP.heroine_02&&Object.keys(DT().T7A_YES).length===3&&!!DT().T7A_YES.classmate_peishan,J([DT().T7A_YES,SP]));
  { const al=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>e.path===SPEC_PATH);
    check('0. 匯入白名單：AA_350 只有一筆 approved＝'+SPEC_SHA+'（DATE-T7A-HOMETOWN-1021）',al.length===1&&al[0].sha===SPEC_SHA&&al[0].status==='approved'&&al[0].task==='DATE-T7A-HOMETOWN-1021'&&!!al[0].approvedBy,J(al.map(e=>[e.sha,e.status,e.task]))); }
  const P=(id,day)=>STORY.presence(id,{day,flags:{},stage:'law'});
  const d0=D('2026-02-02'), sat=D('2026-02-07');   // 大一寒假：以安 1/20～2/20、芷若 1/26～2/18 在台中（characters.js absentDates）
  check('0. 前提：2026-02-02（一）、2026-02-07（六）以安、芷若都在台中（presence kind home、home 台中）；2/7 是週六',['heroine_01','heroine_02'].every(id=>[d0,sat].every(d=>{ const p=P(id,d); return p.here===false&&p.kind==='home'&&p.home==='台中'; }))&&wdOf(sat)===6);

  // ===== 1. 以安在台中、第 5 階：手機的約打開 → 只有「去校外…」→ 只列 D26 =====
  { fresh(d0,10,{}); know('heroine_01',S5);
    const why=INV.whyNot(G,'heroine_01'), can=INV.canInvite(G,'heroine_01');
    check('1. 以安在台中（第 5 階、有聯絡方式）：手機朋友頁不再寫「回台中了，不在臺北。」、有「約」（whyNot 空、canInvite）',why===''&&can===true&&INV.hasContact(G,'heroine_01'),J([why,can]));
    check('1. DATE.homeOnly＝只有 D26',J(DT().homeOnly&&DT().homeOnly(G,'heroine_01'))===J(['D26']),J(DT().homeOnly&&DT().homeOnly(G,'heroine_01')));
    const a=await phoneAsk('heroine_01',['算了']);
    check('1. 按「約」：只有「去校外…」（不列 Café、總圖、吃飯、散步）',J(a.opts[0])===J(['去校外…','算了']),J(a.opts[0]));
    const b=await phoneAsk('heroine_01',['去校外…','算了']);
    check('1. 「去校外…」的清單只有 D26 臺中（第 5 階沒有「兩天一夜…」）',J(b.opts[1])===J([D26(),'算了']),J(b.opts[1]));
    const c=await phoneAsk('heroine_01',['去校外…',D26(),0,label(sat),'08:00','就這樣約']); const t=c.r;
    check('1. 約成：2/7 08:00 D26 一日遊（她在台中，D26 不擋）',!!t&&t.ok&&J(t.locs)===J(['D26'])&&t.day===sat&&t.kind==='day'&&t.status==='booked',J(t&&{ok:t.ok,why:t.why,locs:t.locs,day:t.day,kind:t.kind}));
    const yes=DT().T7A_YES&&DT().T7A_YES.heroine_01, nor=[].concat((DATE_LINES.lines.heroine_01||{}).accept||[],(DATE_LINES.lines.heroine_01||{}).acceptDating||[]);
    check('1. 她答應的那一句＝T7a「'+yes+'」（手機、寫進她的對話串），不說一般那一句',!!yes&&c.L.includes(yes)&&thread('heroine_01').includes('heroine_01:'+yes)&&!c.L.some(x=>nor.includes(x))&&said.some(s=>s.t===yes&&/（手機）$/.test(s.who||'')),J([c.L,thread('heroine_01')])); }

  // ===== 2. 芷若在台中、交往中：一樣只列 D26；兩天一夜也只有 D26；答應的那一句照她的 =====
  { fresh(d0,10,{dating_heroine_02:true}); know('heroine_02',S6);
    check('2. 芷若在台中（交往中）：約打開',INV.whyNot(G,'heroine_02')===''&&INV.canInvite(G,'heroine_02')===true,J([INV.whyNot(G,'heroine_02'),INV.canInvite(G,'heroine_02')]));
    const b=await phoneAsk('heroine_02',['去校外…','兩天一夜…','算了','算了']);
    check('2. 清單只有 D26＋「兩天一夜…」；兩天一夜裡也只有 D26',J(b.opts[1])===J([D26(),'兩天一夜…','算了'])&&J(b.opts[2])===J([D26(),'算了']),J(b.opts.slice(1,3)));
    const c=await phoneAsk('heroine_02',['去校外…','兩天一夜…',D26(),0,label(sat),'09:00','就這樣約']); const t=c.r;
    check('2. 約成：2/7～2/8 D26 兩天一夜',!!t&&t.ok&&t.kind==='overnight'&&J(t.locs)===J(['D26'])&&t.day===sat,J(t&&{ok:t.ok,why:t.why,kind:t.kind,locs:t.locs,day:t.day}));
    const yes=DT().T7A_YES&&DT().T7A_YES.heroine_02, nor=[].concat((DATE_LINES.lines.heroine_02||{}).accept||[],(DATE_LINES.lines.heroine_02||{}).acceptDating||[]);
    check('2. 芷若答應的那一句＝T7a「'+yes+'」，不說一般那一句（交往中那一句也不說）',!!yes&&c.L.includes(yes)&&thread('heroine_02').includes('heroine_02:'+yes)&&!c.L.some(x=>nor.includes(x)),J(c.L)); }

  // ===== 3. 還沒到約校外的程度：照舊關著 =====
  { fresh(d0,10,{}); know('heroine_01',S4);
    check('3. 以安在台中、第 4 階（還不能約校外）：照舊「回台中了，不在臺北。」、沒有「約」',INV.whyNot(G,'heroine_01')==='回台中了，不在臺北。'&&INV.canInvite(G,'heroine_01')===false&&(!DT().homeOnly||DT().homeOnly(G,'heroine_01')===null),J([INV.whyNot(G,'heroine_01'),INV.canInvite(G,'heroine_01')])); }

  // ===== 4. 她回臺北以後的日子：一起從臺北出發＝一般那一句 =====
  { const d17=D('2026-02-17'), d22=D('2026-02-22'); fresh(d17,10,{}); know('heroine_01',S5);
    const p22=P('heroine_01',d22);
    const c=await phoneAsk('heroine_01',['去校外…',D26(),0,label(d22),'08:00','就這樣約']); const t=c.r, yes=DT().T7A_YES&&DT().T7A_YES.heroine_01, acc=(DATE_LINES.lines.heroine_01||{}).accept||[];
    check('4. 2/17（她在台中）約 2/22（她已經回臺北）的 D26：約得成、說一般答應的那一句，不說「我去車站接你」',p22.here!==false&&!!t&&t.ok&&t.day===d22&&!c.L.includes(yes)&&c.L.some(x=>acc.includes(x)),J([p22,t&&t.ok,t&&t.why,c.L])); }

  // ===== 5. 防回歸 =====
  { const d3=D('2026-03-02'); fresh(d3,10,{}); know('heroine_01',S5);
    const a=await phoneAsk('heroine_01',['算了']); const b=await phoneAsk('heroine_01',['去校外…','算了']);
    check('5. 防回歸：以安在臺北（3/2）：約的第一層照舊有校園的地點、校外清單照舊（淡水、臺中都有）',a.opts[0].length>2&&a.opts[0].includes('去校外…')&&b.opts[1].includes(DATE.loc('D13').name)&&b.opts[1].includes(D26())&&(!DT().homeOnly||DT().homeOnly(G,'heroine_01')===null),J([a.opts[0],b.opts[1]])); }
  { const d15=D('2026-01-15'), d21=D('2026-01-21'); fresh(d15,10,{}); know('heroine_01',S5);
    const c=await phoneAsk('heroine_01',['去校外…',D26(),0,label(d21),'08:00','就這樣約']); const t=c.r, yes=DT().T7A_YES&&DT().T7A_YES.heroine_01;
    check('5. 防回歸：在臺北的時候（1/15）約她回台中那幾天（1/21）的 D26（AA_350 S6 的例外）：約得成、照舊一般那一句（T7a 只管她人在台中時）',!!t&&t.ok&&t.day===d21&&(!yes||!c.L.includes(yes)),J([t&&t.ok,t&&t.why,c.L])); }
  { fresh(d0,10,{}); know('heroine_01',S5); const AN='「那幾天我在台中。……換一天。」';
    const c=DATE.check(G,{who:'heroine_01',locs:['D13'],day:sat,depart:10});
    check('5. 防回歸：她在台中的那幾天約別的地方（直接 DATE.check 淡水）照舊 S6 那一句',!c.ok&&c.why===AN,J(c.why)); }
  { fresh(d0,10,{}); know('npc_fangyt',S5); know('heroine_03',S5);
    const f=INV.whyNot(G,'npc_fangyt'), y=INV.whyNot(G,'heroine_03');
    check('5. 防回歸：不是以安、芷若的人照舊——方奕廷回台中「回台中了，不在臺北。」；語彤（在臺北）照常可以約',f==='回台中了，不在臺北。'&&y===''&&(!DT().homeOnly||(DT().homeOnly(G,'npc_fangyt')===null&&DT().homeOnly(G,'heroine_03')===null)),J([f,y])); }
  { fresh(D('2026-07-10'),10,{}); know('classmate_peishan',S5); const pp=P('classmate_peishan',G.day);
    check('5. 防回歸：沛珊寒暑假在台中走她自己那一套（「我去台中找妳？」，hometown3d.js），T7a 不管她',pp.kind==='home'&&(!DT().homeOnly||DT().homeOnly(G,'classmate_peishan')===null),J([pp,DT().homeOnly&&DT().homeOnly(G,'classmate_peishan')])); }

  console.log(fails?('\n'+fails+' 項失敗'):'\n全部通過'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
