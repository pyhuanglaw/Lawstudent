// 兩天一夜的約會（DATE-OVERNIGHT-1021；企劃線 AA_359@fb5156ab（第 5 節：AA 回十三題、5-2 九句改字、5-3 BB 對照看到的；之前 e75d1cce、c7dd0000），大原則 AA_128 第 119 行、第 52 行，AA_126 1-1）：src/date3d.js＋outings3d.js 的 OUT.go。
// 不需要瀏覽器。用法：node tests/date_overnight_unit.js（稿用 git show 讀；證明修改前會失敗時，舊程式放在別的資料夾，SPEC_GIT_DIR＝這個 repo）
require('./alison.js');   /* AA_380：企劃線的舊稿還寫「小語」，讀稿的時候照匯入工具換成 Alison */
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..'), GIT=process.env.SPEC_GIT_DIR||ROOT, SPEC_SHA='fb5156ab', SPEC_PATH='docs/story_planning/AA_359_兩天一夜的約會_住宿那一段.md';
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|DATE|DATE_DATA|DATE_LINES|ROM)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/date3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+String(info).slice(0,600):'')); if(!ok) fails++; };
let said=[], opts=[], picks=[], bgs=[], toasts=[], G=null;
global.ADV={active:false,preload(){},begin(o){ this.active=true; bgs.push(o&&o.background); },end(){ this.active=false; },log(){},speaker(){},cg(){},setBg(b){ bgs.push(b); }};
global.CHAR={setExpr(){}}; global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
/* 選項：picks 的下一個字串在選項裡＝選它；不在（例：互動點台詞中間的小選擇）＝選第一個、不消耗 picks */
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  money(d){ G.money+=d; }, toast(t){ toasts.push(t); },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t,day:G&&G.day,h:G&&G.hour}); },
  choose:async o=>{ const T=o.map(q=>q.t||q.text); T.all=[].concat(...o.map(q=>q.sub||[q.t||q.text])); opts.push(T); if(picks.length){ const w=picks[0]; if(typeof w==='number'){ picks.shift(); return w; } const k=T.findIndex(x=>x.includes(w)); if(k>=0){ picks.shift(); return k; } const g=o.findIndex(q=>(q.sub||[]).some(s=>s.includes(w))); if(g>=0){ if(o[g].dim) picks.shift(); return g; } /* INVITE-MENU-1030 分層：要選的名稱在某一類裡（選項的 sub）＝先選那一類，這個 pick 留給下一層（那一類整個灰掉＝和原本選到灰掉的那一項一樣，用掉這個 pick）*/ } return 0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,flags)=>{ G={v:3,day,hour,zone:'dorm',weekday:wdOf(day),weather:'clear',energy:70,money:20000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; bgs=[]; toasts=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; if(STORY._fy) STORY._fy.reset(); };
const S6={fam:60,trust:45,comf:40,npcRom:55,rom:30}, S5={fam:45,trust:30,comf:20,npcRom:35,rom:10};
const setRel=(id,v)=>Object.assign(SOCIAL.rel(id),v);
const J=x=>JSON.stringify(x), T=()=>said.map(s=>s.t);
const NAME={以安:'heroine_01',芷若:'heroine_02',語彤:'heroine_03',子晴:'heroine_04',學姊:'heroine_05',沛珊:'classmate_peishan',可昕:'kexin'}, H7=Object.values(NAME);
const sec=async(name,fn)=>{ try{ await fn(); }catch(e){ check(name+'（例外）',false,e&&e.stack||e); } };
const D=()=>typeof DATE!=='undefined'?DATE:{};
/* 一趟兩天一夜：預約（直接 DATE.book）→ 出發時間到了 → 走完；回傳 {t,q,r,L,m0} */
const trip=async(o,pk)=>{ const b=D().book(G,Object.assign({depart:9,kind:'overnight'},o)); if(!b||!b.ok) return {b,L:[],t:null};
  const q=OUT.get(G,'date_'+b.trip); G.day=o.day; G.weekday=wdOf(G.day); G.hour=9; said=[]; opts=[]; bgs=[]; picks=['出發'].concat(pk||[]); const m0=G.money; const r=await OUT.prompt(GM,q);
  return {b,q,r,t:D().trip(G,b.trip),L:T(),m0}; };
const after=(L,a,b)=>{ const i=L.indexOf(a), j=L.indexOf(b); return i>=0&&j>i; };
(async()=>{
  // ===== 0. 句子照稿（AA_359@c7dd0000 逐字）、匯入白名單 =====
  let spec=''; try{ spec=cp.execSync('git show '+SPEC_SHA+':"'+SPEC_PATH+'"',{cwd:GIT,encoding:'utf8',maxBuffer:8<<20,stdio:['ignore','pipe','ignore']}); }catch(e){}
  const SP={night:{},narr:null,morning:{},own:{},home:{},fix52:[],drive:null,fix53:[],var53:{}};
  if(spec){ const rows=s=>s.split('\n').filter(l=>l.startsWith('|')&&!/^\|[-| :]+\|$/.test(l.trim())).map(l=>l.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim()));
    const part=(a,b)=>{ const i=spec.indexOf(a), j=b?spec.indexOf(b,i+1):spec.length; return i<0?'':spec.slice(i,j<0?spec.length:j); };
    for(const r of rows(part('## 2.','## 3.'))){ const k=/^還沒交往/.test(r[0])?'single':(/^交往中/.test(r[0])?'dating':(/^D26/.test(r[0])?'home':(/^D28/.test(r[0])?'rent':null))); if(k) SP.night[k]=r[1]; }
    const s3=part('## 3.','## 4.'); { const m=/^>\s*(（[^）]*）)\s*$/m.exec(s3); SP.narr=m&&m[1]; }
    for(const r of rows(s3)){ const id=NAME[r[0]], m=/^「(.*)」$/.exec(r[1]||''); if(id&&m) SP.morning[id]=m[1]; }
    for(const l of s3.split('\n')){ const m=/^\s*-\s*(以安|芷若|沛珊)（D2[68][^）]*）：「(.*)」\s*$/.exec(l); if(m) SP.own[NAME[m[1]]]=m[2]; }
    for(const l of s3.split('\n')){ const m=/^\s*-\s*沛珊（D26[^）]*台中老家[^）]*）：「([^「」]*)」/.exec(l); if(m) SP.home.classmate_peishan=m[1]; }   /* 第 3 節第 4 句（5-1 B2）*/
    { const s53=part('### 5-3.',null);   /* 5-3（fb5156ab）：七列離開句、兩個到達句另一版、子晴那一句 */
      for(const r of rows(s53)){ if(!/^D\d\d$/.test(r[0])) continue; const who=NAME[r[1].slice(0,2)], o=/「([^「」]*)」/.exec(r[2]||''), n=/「([^「」]*)」/.exec(r[3]||''); SP.fix53.push({loc:r[0],who,old:o&&o[1],neu:n&&n[1]}); }
      const q=t=>(String(t||'').match(/「[^「」]*」/g)||[]).map(x=>x.slice(1,-1)), seg=(a,b)=>{ const i=s53.indexOf(a); if(i<0) return ''; const j=b?s53.indexOf(b,i+1):-1; return s53.slice(i,j<0?s53.length:j); };
      const ps=seg('沛珊大三起住在台南','（原句'); SP.var53.ps=q(ps); SP.var53.psOld=q(seg('（原句','留給'));
      const kx=/同一趟的版本「([^「」]*)」/.exec(s53), kxOld=/可昕第一次：「([^「」]*)」/.exec(s53); SP.var53.kx=kx&&kx[1]; SP.var53.kxOld=kxOld&&kxOld[1];
      const zq=/子晴一般：「([^「」]*)」→ 不分版本都改「([^「」]*)」/.exec(s53); SP.var53.zq=zq&&{old:zq[1],neu:zq[2]}; }
    for(const r of rows(part('### 5-2.','### 5-3.'))){ if(!/^D\d\d$/.test(r[0])) continue; const who=NAME[r[1].slice(0,2)], o=/「([^「」]*)」/.exec(r[2]||''), n=/「([^「」]*)」/.exec(r[3]||''); SP.fix52.push({loc:r[0],who,old:o&&o[1],neu:n&&n[1]}); }
    { const m=/旁白「(（吃完早餐[^」]*）)」/.exec(part('- **B8','- **B9')); SP.drive=m&&m[1]; } }
  check('0. 讀得到稿 AA_359@'+SPEC_SHA+'：晚上四種、早上旁白、七位一句、住自己家／租的地方三句',!!spec&&Object.keys(SP.night).length===4&&!!SP.narr&&Object.keys(SP.morning).length===7&&Object.keys(SP.own).length===3,J(SP));
  check('0. 晚上那一句（第 2 節）四種逐字：兩間房／民宿／她回家／她回租的地方',!!D().NIGHT&&['single','dating','home','rent'].every(k=>D().NIGHT[k]===SP.night[k]),J([D().NIGHT,SP.night]));
  check('0. 第二天早上的旁白一律「'+SP.narr+'」',!!SP.narr&&D().MORNING_NARR===SP.narr,D().MORNING_NARR);
  check('0. 七位早上那一句（第 3 節表格）逐字',!!D().MORNING&&H7.every(id=>D().MORNING[id]===SP.morning[id]),J(H7.filter(id=>!D().MORNING||D().MORNING[id]!==SP.morning[id])));
  check('0. 住自己家、租的地方那三句逐字（以安、芷若 D26；沛珊 D28）',!!D().MORNING_OWN&&['heroine_01','heroine_02','classmate_peishan'].every(id=>D().MORNING_OWN[id]===SP.own[id])&&Object.keys(D().MORNING_OWN).length===3,J([D().MORNING_OWN,SP.own]));
  { const al=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>e.path===SPEC_PATH);
    check('0. 匯入白名單：AA_359 只有一筆 approved＝'+SPEC_SHA+'（DATE-OVERNIGHT-1021）',al.length===1&&al[0].sha===SPEC_SHA&&al[0].status==='approved'&&al[0].task==='DATE-OVERNIGHT-1021'&&!!al[0].approvedBy,J(al.map(e=>[e.sha,e.status,e.task]))); }
  const sat=STORY.termDay('Y1S2',5,6);   // 2026-03-28（六）
  // ===== 1. 誰約得到（第 6 階或交往中）=====
  await sec('1',async()=>{
    fresh(sat,7,{}); G.contacts.heroine_03=1; setRel('heroine_03',S5);
    check('1. 第 5 階（她的戀愛 ≥30、還不到 55）：約不到兩天一夜',DATE.stageNum('heroine_03')===5&&D().canOvernight&&!D().canOvernight(G,'heroine_03'),DATE.stageNum('heroine_03'));
    let c=DATE.check(G,{who:'heroine_03',locs:['D28'],day:sat,depart:9,kind:'overnight'}); check('1. 第 5 階：DATE.check 不行、寫原因（要第 6 階或交往中）',!c.ok&&/第 6 階/.test(c.why),c.why);
    const b=DATE.book(G,{who:'heroine_03',locs:['D28'],day:sat,depart:9,kind:'overnight'}); check('1. 第 5 階：直接預約也擋',!b.ok&&!(G.trips||[]).length,J(b));
    picks=['算了']; await DATE.menu(GM,'heroine_03',null); const L0=DATE.loc('D28').name;
    check('1. 第 5 階的約會清單：沒有「兩天一夜…」、沒有臺南（D28～D32 不列）；臺中、嘉義（一日）照列',!opts[0].some(x=>/兩天一夜/.test(x))&&!opts[0].all.includes(L0)&&opts[0].all.includes(DATE.loc('D26').name)&&opts[0].all.includes(DATE.loc('D27').name),opts[0].all.join('/'));   /* all：分層的一類展開（INVITE-MENU-1030）*/
    setRel('heroine_03',S6); opts=[]; picks=['兩天一夜…','算了','算了']; await DATE.menu(GM,'heroine_03',null);
    const ov=opts[1]||[]; check('1. 第 6 階：多一個「兩天一夜…」；裡面是 D26～D32（有底圖、有台詞的；D32 清境的底圖 abad2fa0），沒有淡水',opts[0].includes('兩天一夜…')&&['D26','D27','D28','D29','D30','D31','D32'].every(k=>ov.includes(DATE.loc(k).name))&&ov.length===8&&!ov.includes(DATE.loc('D13').name),J(opts.slice(0,2)));
    check('1. 第 6 階的主清單照樣沒有臺南（只在「兩天一夜…」裡）',!opts[0].includes(L0),opts[0].join('/'));
    check('1. 交往中不看階段',(()=>{ setRel('heroine_03',{fam:20,trust:5,comf:5,npcRom:0,rom:0}); G.flags.dating_heroine_03=true; const ok=D().canOvernight(G,'heroine_03'); delete G.flags.dating_heroine_03; return ok; })()); });
  // ===== 2. 第 6 階、沒交往：從選單約臺南 → 兩天走完（兩間房那句；第二天不重複第一天的點；多扣住宿 2,500）=====
  await sec('2',async()=>{
    fresh(sat,7,{}); G.contacts.heroine_03=1; setRel('heroine_03',S6); const L28=DATE.loc('D28');
    picks=['兩天一夜…',L28.name,'高鐵','今天','09:00','就這樣約']; const tb=await DATE.menu(GM,'heroine_03',null); const sum=T().find(x=>/兩天一夜/.test(x))||'';
    check('2. 選單約成：kind overnight、住一晚、09:00 出發、住宿 2500、車資照表（高鐵來回 2800，BUG-DATE-FARE-DOUBLE-1021 以後不再乘 2）、第二天 19:00 離開、21:15 回到台大',!!tb&&tb.ok&&tb.kind==='overnight'&&tb.nights===1&&tb.depart===9&&tb.lodging===2500&&tb.fare===2800&&tb.leave===19&&Math.abs(tb.back-21.25)<1e-9&&tb.day===sat,J(tb));
    check('2. 確認的摘要寫兩天：出發、住一晚、第二天回來、含住宿',/（兩天一夜）：今天.*09:00 出發.*住一晚，明天.*21:15 回到台大。預計花費 5300 元（含住宿 2500 元）/.test(sum),sum);
    check('2. 日期選項寫兩天（今天～明天）、時間只有 09:00',(opts.find(o=>o.some(x=>/^今天 .*～/.test(x)))||[]).length===8&&(opts.find(o=>o.some(x=>/出發$/.test(x)))||[]).filter(x=>/出發$/.test(x)).join()==='09:00 出發',J(opts.slice(2,5)));
    const q=OUT.get(G,'date_'+tb.trip); G.hour=9; check('2. 09:00 問要不要出發（排進行事曆：到達 11:15）',!!q&&OUT.due(G)===q&&Math.abs(q.h-11.25)<1e-9,J(q));
    said=[]; opts=[]; bgs=[]; picks=['出發','文學館的大廳','海堤的夕陽','安平的老巷','館前的圓環綠地']; const m0=G.money, R0=Object.assign({},SOCIAL.rel('heroine_03')); const r=await OUT.prompt(GM,q); const L=T(), t=DATE.trip(G,tb.trip), Lg=DATE.log(G,'heroine_03');
    const first=((((DATE_LINES.loc.D28||{}).lines||{}).heroine_03||{}).arrive||{}).first, a1=first&&first.lines&&first.lines[0].text;
    check('2. 第一天：到達（「（'+L28.name+'。）」＋第一次的到達那一句）',L.includes('（'+L28.name+'。）')&&!!a1&&L.includes(a1),L.slice(0,4).join(' | '));
    check('2. 第一天晚上：「'+SP.night.single+'」（兩間房）、不演住宿',L.includes(D().NIGHT&&D().NIGHT.single)&&L.filter(x=>/旅館|民宿/.test(x)).length===1&&t.night==='single',L.join(' | '));
    check('2. 第二天 08:30：「'+SP.narr+'」＋語彤「'+SP.morning.heroine_03+'」',after(L,SP.night.single,SP.narr)&&L[L.indexOf(SP.narr)+1]===SP.morning.heroine_03,L.join(' | '));
    const d2=opts.find(o=>o.includes('差不多了，回去吧'))||[];
    check('2. 第一天最多兩個互動點；第二天只列沒走過的（老巷、圓環），不列文學館；夕陽只在第一天第二個點（AA_359 5-1 B7），第二天不列',d2.includes('館前的圓環綠地')&&d2.includes('安平的老巷')&&!d2.includes('文學館的大廳')&&!d2.includes('海堤的夕陽')&&!opts.some(o=>o.includes('今天先到這裡')&&o.includes('館前的圓環綠地')&&o.length<3),J(opts));
    check('2. 四個點分兩天走完、算一次（dateLog 照算一次）、DATE_OVERNIGHT 照人物記一次（語彤 1；AA_359 5-1 B9，不記地點）',r==='go'&&t.status==='done'&&t.spots.length===4&&Lg.count===1&&Lg.byLoc.D28===1&&G.flags.DATE_OVERNIGHT&&J(G.flags.DATE_OVERNIGHT)===J({heroine_03:1}),J({r,st:t.status,spots:t.spots,count:Lg.count,DO:G.flags.DATE_OVERNIGHT}));
    check('2. 錢：車資 2800＋住宿 2500＋老巷 60＝5360（比當天來回多 2500）',m0-G.money===2800+2500+60,m0-G.money);
    check('2. 結算寫兩天、含住宿；關係照正式校外約會加（第一次去這個地點）',L.some(x=>/^（這兩天去了臺南國立臺灣文學館與安平：文學館的大廳、海堤的夕陽、安平的老巷、館前的圓環綠地。花了 5360 元（含來回車資、住宿）。）$/.test(x))&&SOCIAL.rel('heroine_03').npcRom-R0.npcRom>=5,L.slice(-2).join(' | '));
    check('2. 第二天回到台大（隔天，回程照高鐵 135 分鐘）',G.day===sat+1&&G.hour>10&&G.hour<21.5,J([G.day-sat,G.hour]));
    const bgi=bgs.map(b=>(b&&b.image||'').replace(/^.*\//,''));
    check('2. 底圖：兩天都用 d28a；選「海堤的夕陽」那一點才換 d28b，第二天早上回到 d28a（AA_359 5-1 B12）',bgi.length===3&&/^d28a_base_day/.test(bgi[0])&&/^d28b_base_sunset/.test(bgi[1])&&/^d28a_base_day/.test(bgi[2]),J(bgi));
    { const iS=said.findIndex(x=>x.t===SP.night.single); check('2. 夕陽演完時間至少到 18:00，接晚上那一句（B7）',iS>0&&said[iS].day===sat&&said[iS].h>=18,J(said[iS])); }
    { const d1a=opts.find(o=>o.includes('今天先到這裡'))||[]; check('2. 第一天第一個點的清單沒有夕陽（B7：只在第二個點）',d1a.includes('文學館的大廳')&&!d1a.includes('海堤的夕陽'),J(d1a)); }
    check('2. 第二天以後：鬧鐘、跳過時間不再有這一趟',!DATE.alarmsFor(G,sat).length&&!DATE.alarmsFor(G,sat+1).length); });
  // ===== 3. 交往中：民宿那句（芷若，高雄）=====
  await sec('3',async()=>{
    const d=STORY.termDay('Y1S2',4,6); fresh(d-1,20,{dating_heroine_02:true}); setRel('heroine_02',{fam:30,trust:10,comf:10,npcRom:10,rom:10});
    const r=await trip({who:'heroine_02',locs:['D29'],day:d,transport:'hsr'},['倉庫改的展間','巨大的戶外雕塑','港邊的步道','舊鐵道的草地']);
    check('3. 交往中（階段不到也可以）：晚上「'+SP.night.dating+'」（民宿，不演房間裡的事）',!!r.t&&r.L.includes(SP.night.dating)&&!r.L.includes(SP.night.single)&&r.t.night==='dating',r.L.join(' | '));
    check('3. 第二天早上：芷若「'+SP.morning.heroine_02+'」',r.L[r.L.indexOf(SP.narr)+1]===SP.morning.heroine_02,r.L.join(' | '));
    check('3. 算一次、DATE_OVERNIGHT 芷若記一次（照人物，B9）',!!r.t&&r.t.status==='done'&&DATE.log(G,'heroine_02').count===1&&J(G.flags.DATE_OVERNIGHT)===J({heroine_02:1}),J(G.flags.DATE_OVERNIGHT)); });
  // ===== 4. D31＋D32 同一趟：第一天日月潭、第二天清境，各用各自的到達、離開句；日月潭的離開句不用 =====
  await sec('4',async()=>{
    const d=STORY.termDay('Y1S2',6,6); fresh(d-1,20,{}); setRel('heroine_04',S6);
    const P=DATE.plan(G,{who:'heroine_04',locs:['D31','D32'],day:d,depart:9,kind:'overnight',transport:'hsr+coach'});
    check('4. D31＋D32：清境要車＝整趟開車；去程照日月潭、回程照清境（210 分＋還車 30 分）；車資＝(1000＋1200)÷2（去程、回程各一半）',P.ok&&P.transport==='car'&&P.fare===1100&&Math.abs(P.back-(19+210/60+0.5))<1e-9&&J(P.locs)==='["D31","D32"]',J(P));
    check('4. 預約時就算住宿：1100＋2500＝3600',DATE.check(G,{who:'heroine_04',locs:['D31','D32'],day:d,depart:9,kind:'overnight',transport:'car'}).cost===3600,J(DATE.check(G,{who:'heroine_04',locs:['D31','D32'],day:d,depart:9,kind:'overnight',transport:'car'})));
    const r=await trip({who:'heroine_04',locs:['D31','D32'],day:d,transport:'car'},['湖邊步道','湖邊的茶葉蛋攤','觀景台看雲海','大草原']);
    const LS=(loc,k)=>{ const C=(((DATE_LINES.loc[loc]||{}).lines||{}).heroine_04||{})[k]||{}, out=[]; for(const s of [C.first].concat(C.normal||[],C.dating||[])) for(const x of ((s&&s.lines)||[])) out.push(x.text); return out; };
    const a31=LS('D31','arrive'), a32=LS('D32','arrive'), c31=LS('D31','closing'), c32f=((((DATE_LINES.loc.D32||{}).lines||{}).heroine_04||{}).closing||{}).first;
    check('4. 第一天「（南投日月潭。）」＋日月潭的到達那一句；第二天早上那一句之後「'+SP.drive+'」（B8，取代「（南投清境農場。）」那一行）＋清境的到達那一句',!!SP.drive&&after(r.L,'（南投日月潭。）',SP.night.single)&&r.L.some(x=>a31.includes(x))&&r.L[r.L.indexOf(SP.narr)+2]===SP.drive&&!r.L.includes('（南投清境農場。）')&&r.L.slice(r.L.indexOf(SP.drive)).some(x=>a32.includes(x)),r.L.join(' | '));
    { const iD=said.findIndex(x=>x.t===SP.drive), iM=said.findIndex(x=>x.t===SP.narr), aD=said.slice(iD+1).find(x=>a32.includes(x.t)); check('4. 開車上清境：時間推 1.5 小時（08:30 → 10:00 到清境）',iD>0&&iM>0&&Math.abs(said[iM].h-8.5)<1e-9&&!!aD&&Math.abs(aD.h-10)<1e-9,J([said[iM],aD])); }
    check('4. 離開那一句用清境的（第一次那一套），日月潭的離開句一句都沒有',!!c32f&&c32f.lines.every(x=>r.L.includes(x.text))&&!r.L.some(x=>c31.includes(x)),r.L.slice(-4).join(' | '));
    const d2=opts.find(o=>o.includes('差不多了，回去吧'))||[];
    check('4. 第二天的互動點是清境的四個（日月潭的不列）',['大草原','高山步道','觀景台看雲海','山上的小攤'].every(x=>d2.includes(x)||r.t.spots.includes('D32.meadow')&&x==='大草原')&&!d2.some(x=>/湖邊|遊湖|纜車/.test(x)),J(opts));
    check('4. 一趟只算一次；byLoc D31、D32 各記一次；DATE_OVERNIGHT 照人物、同一趟也只記一次（子晴 1，B9）',!!r.t&&r.t.status==='done'&&DATE.log(G,'heroine_04').count===1&&DATE.log(G,'heroine_04').byLoc.D31===1&&DATE.log(G,'heroine_04').byLoc.D32===1&&J(G.flags.DATE_OVERNIGHT)===J({heroine_04:1}),J(G.flags.DATE_OVERNIGHT));
    check('4. 錢：車資 1100＋住宿 2500＋茶葉蛋 10＋草原門票 200',r.m0-G.money===1100+2500+10+200,r.m0-G.money);
    check('4. 第一天、第二天的記憶各記各的（dateMemory 的 last）',J(DATE.mem(G,'heroine_04','D31').last)===J(['D31.trail','D31.egg'])&&J(DATE.mem(G,'heroine_04','D32').last)===J(['D32.cloud','D32.meadow']),J(G.dateMemory.heroine_04));
    const i31=bgs.findIndex(b=>b&&/d31_base/.test(b.image||'')), i32=bgs.findIndex(b=>b&&/d32_base_afternoon/.test(b.image||''));
    check('4. 底圖：第一天日月潭（d31）、第二天到清境換 d32_base_afternoon（企劃線 abad2fa0 那一張，使用者 10-17 核准）',i31===0&&i32>i31&&!!OUT.BG.d32_base_afternoon&&fs.existsSync(path.join(ROOT,OUT.BG.d32_base_afternoon.image)),J(bgs));
    // 選單：D31 多一個「日月潭＋清境」，選了只能開車（不問交通）；清境自己也列在「兩天一夜…」
    fresh(d-1,20,{}); setRel('heroine_04',S6); G.contacts.heroine_04=1; const L31=DATE.loc('D31').name, L32=DATE.loc('D32').name;
    picks=['兩天一夜…',L31,L31+'＋'+L32,'明天','09:00','就這樣約']; const tb=await DATE.menu(GM,'heroine_04',null); const ovl=opts[1]||[], cmb=opts[2]||[];
    check('4. 「兩天一夜…」清單有清境（有底圖、有台詞）；日月潭多問一次「只去日月潭／日月潭＋清境」',ovl.includes(L32)&&J(cmb)===J(['只去'+L31,L31+'＋'+L32]),J(opts.slice(0,3)));
    check('4. 選了日月潭＋清境：不問交通（只能開車）、直接選日期；約成 locs D31、D32、開車、住宿 2500',!!tb&&tb.ok&&J(tb.locs)===J(['D31','D32'])&&tb.transport==='car'&&tb.lodging===2500&&/^今天 .*～/.test((opts[3]||[])[0]||''),J({tb,o3:opts[3]}));
    check('4. 清境自己不會再問「＋日月潭」（第一天日月潭、第二天清境，順序固定）',DATE.comboOf('D32')===null&&DATE.comboOf('D31')==='D32'); });
  // ===== 5. 考試週排不進去（AA_126 1-1）=====
  await sec('5',async()=>{
    const d16=STORY.termDay('Y1S2',16,6), d7=STORY.termDay('Y1S2',7,7); fresh(d7-3,10,{}); setRel('heroine_03',S6);
    const a=DATE.check(G,{who:'heroine_03',locs:['D28'],day:d16,depart:9,kind:'overnight'}), b=DATE.check(G,{who:'heroine_03',locs:['D28'],day:d7,depart:9,kind:'overnight'}), c=DATE.check(G,{who:'heroine_03',locs:['D28'],day:d7-1,depart:9,kind:'overnight'});
    check('5. 期末考週（第 16 週六）：不能選，寫「考試週」',!a.ok&&a.why==='考試週',a.why);
    check('5. 第二天落在期中考週（第 7 週日出發、第 8 週一回來）：也不行',!b.ok&&b.why==='考試週',b.why);
    check('5. 對照：第 7 週六～日可以',c.ok,c.why);
    G.contacts.heroine_03=1; G.day=d16-6; G.weekday=wdOf(G.day); G.hour=7; opts=[]; picks=['兩天一夜…',DATE.loc('D28').name,'高鐵',DATE.dayLabel(G,d16).split('（')[0].trim(),'09:00','算了']; await DATE.menu(GM,'heroine_03',null);
    check('5. 選單：考試週那天的「09:00 出發」灰掉、寫考試週；選了只提示、約不成',toasts.includes('考試週')&&!(G.trips||[]).length,J(toasts)); });
  // ===== 6. 沛珊大三起 D28：她回租的地方、早上在樓下 =====
  await sec('6',async()=>{
    const d=STORY.termDay('Y3S1',5,6); fresh(d-1,20,{PS_RECONNECT:true}); setRel('classmate_peishan',S6);
    const w=D().whereOn?D().whereOn(G,'classmate_peishan',d):null; check('6. 沛珊大三上週末在台南（租的地方，PS_TN）',!!w&&w.city==='台南'&&w.own==='rent',J(w));
    const c29=DATE.check(G,{who:'classmate_peishan',locs:['D29'],day:d,depart:9,kind:'overnight',transport:'hsr'});
    check('6. 她兩天都在台南：約高雄（D29）不行（她不在那裡、也不在臺北）',!c29.ok&&/台南/.test(c29.why),c29.why);
    const r=await trip({who:'classmate_peishan',locs:['D28'],day:d,transport:'hsr'},['文學館的大廳','安平的老巷','館前的圓環綠地']);
    check('6. 約臺南（D28）可以；晚上「'+SP.night.rent+'」',!!r.t&&r.L.includes(SP.night.rent)&&r.t.night==='rent',r.L.join(' | '));
    check('6. 早上：「'+SP.own.classmate_peishan+'」（不是一般那句）',r.L[r.L.indexOf(SP.narr)+1]===SP.own.classmate_peishan&&!r.L.includes(SP.morning.classmate_peishan),r.L.join(' | '));
    check('6. 你一個人的住宿照樣 2500',!!r.t&&r.m0-G.money===2800+2500+60,r.m0-G.money); });
  // ===== 7. D26：以安、芷若剛好在臺中的家（AA_350 S6）=====
  await sec('7',async()=>{
    const d=STORY.dayOfKey('2026-07-25'); fresh(d-2,20,{}); setRel('heroine_01',S6);
    const c=DATE.check(G,{who:'heroine_01',locs:['D26'],day:d,depart:9,kind:'overnight',transport:'hsr'}), c28=DATE.check(G,{who:'heroine_01',locs:['D28'],day:d,depart:9,kind:'overnight',transport:'hsr'});
    check('7. 以安 7/25～7/26 在台中：約臺中（D26）可以；約臺南不行、照 S6 那一句',c.ok&&!c28.ok&&c28.why==='「那幾天我在台中。……換一天。」',J([c.why,c28.why]));
    const r=await trip({who:'heroine_01',locs:['D26'],day:d,transport:'hsr'},['草悟道','國立臺灣美術館','審計新村','市民廣場']);
    check('7. 出發那天她人在台中照樣出發（不看今天在不在臺北）；晚上「'+SP.night.home+'」',r.r==='go'&&r.L.includes(SP.night.home)&&r.t.night==='home',r.L.join(' | '));
    check('7. 早上：以安「'+SP.own.heroine_01+'」',r.L[r.L.indexOf(SP.narr)+1]===SP.own.heroine_01,r.L.join(' | '));
    check('7. 住宿照扣 2500（車資 1600＋審計新村 100）',r.m0-G.money===1600+2500+100,r.m0-G.money);
    check('7. 芷若在臺中的家：「'+SP.own.heroine_02+'」；可昕在高雄的家（稿沒寫）：用一般那句',D().morningLine('heroine_02','home')===SP.own.heroine_02&&D().morningLine('kexin','home')===SP.morning.kexin); });
  // ===== 8. 七位各跑一次（第 6 階沒交往、交往中）：早上那一句逐字對稿 =====
  await sec('8',async()=>{ const days=[STORY.termDay('Y1S2',3,6),STORY.termDay('Y2S1',7,6),STORY.termDay('Y2S1',10,6)], bad=[];   /* 每個人挑第一個兩天都有空的週末（沛珊大一下到大二上第 6 週有交往的對象；語彤大二上的週六有事）*/
    for(const dating of [false,true]) for(const id of H7){ const d=days.find(x=>{ fresh(x-1,20,{}); setRel(id,S6); const c=DATE.check(G,{who:id,locs:['D27'],day:x,depart:9,kind:'overnight',transport:'hsr'}); return c.ok&&(!D().stillOn||D().stillOn(G,{who:id,day:x,locs:['D27']}).ok); })||days[0];
      fresh(d-1,20,dating?{['dating_'+id]:true}:{}); setRel(id,S6);
      const r=await trip({who:id,locs:['D27'],day:d,transport:'hsr'},['木屋的緣側','院子的老樹','檜木小店','舊鐵道和小火車']); const i=r.L.indexOf(SP.narr);
      const nk=dating?'dating':'single'; if(!r.t||r.r!=='go') bad.push(id+(dating?'（交往中）':'')+' 約不了：'+J(r.b)); else if(!r.L.includes(SP.night[nk])) bad.push(id+' 晚上不是'+nk); else if(i<0||r.L[i+1]!==SP.morning[id]) bad.push(id+(dating?'（交往中）':'')+' 早上：'+(i<0?'沒有旁白':r.L[i+1])); else if(r.t.status!=='done') bad.push(id+' 沒走完：'+r.t.status); }
    check('8. 七位 × 沒交往／交往中（嘉義 D27）：晚上那一句對、早上旁白後面是她那一句（逐字）、兩天走完',!bad.length,bad.join('；')); });
  // ===== 9. 錯過：玩家沒出發、她第一天沒辦法來——取消、不扣關係、住宿費不扣 =====
  await sec('9',async()=>{
    fresh(sat-1,20,{}); setRel('heroine_03',S6); const b=DATE.book(G,{who:'heroine_03',locs:['D28'],day:sat,depart:9,kind:'overnight',transport:'hsr'}); const q=OUT.get(G,'date_'+b.trip), R0=J(SOCIAL.rel('heroine_03')), m0=G.money;
    G.day=sat; G.weekday=wdOf(sat); G.hour=q.h+1.5; OUT.tick(GM); DATE.tick(GM); const t=DATE.trip(G,b.trip);
    check('9. 玩家沒出發（過了出發時間）：missed、不算次數、不扣關係、沒有放鴿子、錢沒少（住宿是晚上才扣）',q.state==='missed'&&t.status==='missed'&&DATE.log(G,'heroine_03').count===0&&J(SOCIAL.rel('heroine_03'))===R0&&!G.flags.FLAKED_heroine_03&&!DATE.log(G,'heroine_03').cancels.length&&G.money===m0,J({q:q.state,t:t.status,money:m0-G.money}));
    const c=DATE.check(G,{who:'heroine_03',locs:['D13'],day:sat+1,depart:15,transport:'mrt'}); check('9. 錯過的那一趟不再佔第二天（隔天照常約得到）',c.ok,c.why);
    fresh(sat-1,20,{}); setRel('heroine_03',S6); const b2=DATE.book(G,{who:'heroine_03',locs:['D28'],day:sat,depart:9,kind:'overnight',transport:'hsr'}); const q2=OUT.get(G,'date_'+b2.trip), R1=J(SOCIAL.rel('heroine_03')), m1=G.money;
    ROM.get(G,'heroine_03').status='paused'; G.day=sat; G.weekday=wdOf(sat); G.hour=9; said=[]; picks=['出發']; const r=await OUT.prompt(GM,q2); const t2=DATE.trip(G,b2.trip);
    check('9. 她第一天沒辦法來（約好以後在等你說清楚）：不出發、說原因、missed、不扣關係、錢沒少',r==='no'&&t2.status==='missed'&&q2.state==='missed'&&T().some(x=>/她在等你把話說清楚/.test(x))&&J(SOCIAL.rel('heroine_03'))===R1&&G.money===m1&&!G.flags.FLAKED_heroine_03,J({r,t:t2.status,L:T()})); });
  // ===== 10. 同一天的其他約、改時間 =====
  await sec('10',async()=>{
    fresh(sat-2,20,{}); setRel('heroine_03',S6); setRel('heroine_01',S6); const b=DATE.book(G,{who:'heroine_03',locs:['D28'],day:sat,depart:9,kind:'overnight',transport:'hsr'});
    const c1=DATE.check(G,{who:'heroine_01',locs:['D13'],day:sat+1,depart:15,transport:'mrt'}), c2=DATE.check(G,{who:'heroine_01',locs:['D26'],day:sat-1,depart:9,kind:'overnight',transport:'hsr'});
    check('10. 兩天一夜佔兩天：第二天不能再約別的（一日遊、兩天一夜那天只能一場）',!c1.ok&&/兩天一夜/.test(c1.why),c1.why);
    check('10. 前一天出發的兩天一夜：第二天撞到 → 不行（寫「隔天」）',!c2.ok&&/^隔天已經有兩天一夜的行程/.test(c2.why),c2.why);
    const q=OUT.get(G,'date_'+b.trip), t=DATE.trip(G,b.trip); G.day=sat; G.weekday=wdOf(sat); G.hour=9; opts=[]; picks=['改時間','算了，今天不去了']; await OUT.prompt(GM,q);
    check('10. 改時間：兩天一夜固定 09:00 出發，沒有「晚一個小時」；今天不去了＝照一日約會的取消',(opts[1]||[]).length===3&&!(opts[1]||[]).some(x=>/晚一個小時/.test(x))&&t.status==='cancelled'&&!G.flags.FLAKED_heroine_03,J(opts)); });
  // ===== 11. 舊存檔 =====
  await sec('11',async()=>{
    fresh(sat,9,{}); setRel('heroine_03',S6); const b=DATE.book(G,{who:'heroine_03',locs:['D13'],day:sat,depart:15,transport:'mrt'}); delete G.flags.DATE_OVERNIGHT;
    G=JSON.parse(JSON.stringify(G)); SOCIAL.bind(G); EVENTS.bind(GM); DATE.rec(G);
    check('11. 舊存檔讀進來：DATE_OVERNIGHT 補成 {}，已經排好的一日約會照舊（booked、沒有兩天一夜的欄位）',J(G.flags.DATE_OVERNIGHT)==='{}'&&G.trips.length===1&&G.trips[0].status==='booked'&&G.trips[0].kind==='half'&&G.trips[0].nights==null,J(G.trips));
    G.flags.DATE_OVERNIGHT='壞掉'; DATE.rec(G); check('11. DATE_OVERNIGHT 不是物件：補成 {}',J(G.flags.DATE_OVERNIGHT)==='{}');
    const q=OUT.get(G,'date_'+b.trip); G.hour=15; said=[]; picks=['出發','飲料攤','差不多了']; const r=await OUT.prompt(GM,q);
    check('11. 舊存檔的一日約會照常走完、算一次；不記 DATE_OVERNIGHT',r==='go'&&DATE.trip(G,b.trip).status==='done'&&DATE.log(G,'heroine_03').count===1&&J(G.flags.DATE_OVERNIGHT)==='{}',J({r,DO:G.flags.DATE_OVERNIGHT}));
    fresh(sat,7,{}); setRel('heroine_03',S6); await trip({who:'heroine_03',locs:['D28'],day:sat,transport:'hsr'},['文學館的大廳','差不多了']); const x=DATE.log(G,'heroine_03').count;
    G.day=sat+7; G.weekday=wdOf(G.day); G.hour=7; await trip({who:'heroine_03',locs:['D28'],day:sat+7,transport:'hsr'},['館前的圓環綠地','今天先到這裡','安平的老巷']);
    check('11. DATE_OVERNIGHT 記次數（照人物，B9）：和語彤去兩次＝2（第二次第一天只做一個也算）',J(G.flags.DATE_OVERNIGHT)===J({heroine_03:2})&&DATE.log(G,'heroine_03').count===x+1,J(G.flags.DATE_OVERNIGHT));
    G.day=sat+14; G.weekday=wdOf(G.day); G.hour=7; const fam0=SOCIAL.rel('heroine_03').fam, m0=G.money; const r0=await trip({who:'heroine_03',locs:['D28'],day:sat+14,transport:'hsr'},['今天先到這裡','就這樣回去']);
    check('11. 兩天一個互動點都沒做：不算次數、不記 DATE_OVERNIGHT、熟悉 +1（照當天來回）；住了一晚＝住宿照扣',r0.t&&r0.t.status==='cancelled'&&J(G.flags.DATE_OVERNIGHT)===J({heroine_03:2})&&SOCIAL.rel('heroine_03').fam===fam0+1&&m0-G.money===2800+2500,J({st:r0.t&&r0.t.status,DO:G.flags.DATE_OVERNIGHT,spent:m0-G.money})); });
  // ===== 13. 讀檔：到了那裡時存的檔（OUT.go 的 q.arrived）讀回來，照樣「出發」重新演，不會變成「這次趕不上了」（車程 135 分鐘）=====
  await sec('13',async()=>{
    fresh(sat-1,20,{}); setRel('heroine_03',S6); const b=DATE.book(G,{who:'heroine_03',locs:['D28'],day:sat,depart:9,kind:'overnight',transport:'hsr'}); const q=OUT.get(G,'date_'+b.trip);
    q.arrived=true; G.day=sat; G.weekday=wdOf(sat); G.hour=q.h; said=[]; opts=[]; picks=['出發','文學館的大廳','差不多了']; const due=OUT.due(G)===q; const r=await OUT.prompt(GM,q);
    check('13. 到達後存的檔讀回來：還問「現在要出發嗎？」、三個選項，出發就從到達那一句重新演',due&&J(opts[0])===J(['出發','改時間','今天不去了'])&&r==='go'&&T().includes('（'+DATE.loc('D28').name+'。）')&&!T().some(x=>/趕不上/.test(x)),J({due,o:opts[0],r,L:T().slice(0,2)})); });
  await sec('13b',async()=>{
    fresh(sat-1,20,{}); setRel('heroine_03',S6); const b1=DATE.book(G,{who:'heroine_03',locs:['D24'],day:sat,depart:9,transport:'coach'}); const q1=OUT.get(G,'date_'+b1.trip);
    q1.arrived=true; G.day=sat; G.weekday=wdOf(sat); G.hour=q1.h; said=[]; opts=[]; picks=['出發','差不多了','就這樣回去']; const r1=await OUT.prompt(GM,q1);
    check('13. 當天來回也一樣（礁溪客運 90 分鐘，到了才存的檔）：不會變成「這次趕不上了」',r1==='go'&&J(opts[0])===J(['出發','改時間','今天不去了'])&&!T().some(x=>/趕不上/.test(x)),J({r1,o:opts[0],L:T().slice(0,1)})); });
  // ===== 12. 底圖登錄 =====
  await sec('12',async()=>{
    check('12. D28 的底圖：兩天都是 d28a_base_day；「海堤的夕陽」那一點是 d28b_base_sunset（AA_359 5-1 B12；OUT.BG 有登錄、assets/bg 有檔）',D().bgKey('D28',0)==='d28a_base_day'&&D().bgKey('D28',1)==='d28a_base_day'&&!!D().pointBg&&D().pointBg('D28.sunset')==='d28b_base_sunset'&&D().pointBg('D28.museum')===null&&['d28a_base_day','d28b_base_sunset'].every(k=>OUT.BG[k]&&fs.existsSync(path.join(ROOT,OUT.BG[k].image))),J([D().bgKey('D28',0),D().bgKey('D28',1),D().pointBg&&D().pointBg('D28.sunset')]));
    check('12. 其他地點照舊挑登記的第一張（D02 陰天）',D().bgKey('D02',0)==='d02_base_overcast'&&D().bgKey('D02',1)==='d02_base_overcast'); });
  // ===== 14. AA_359 第 5 節（e75d1cce；AA 回十三題）：B2 沛珊在台中老家的 D26、B7 有時間的互動點、5-2 九句改字 =====
  await sec('14',async()=>{
    check('14. 讀得到稿第 5 節：B2 那一句、B8 的旁白、5-2 九列',!!SP.home.classmate_peishan&&!!SP.drive&&SP.fix52.length===9&&SP.fix52.every(x=>x.who&&x.old&&x.neu),J([SP.home,SP.drive,SP.fix52.length]));
    check('14. B2：沛珊 D26（她剛好在台中老家）早上那一句逐字（DATE.MORNING_HOME）；D28 租的地方那句照舊',!!D().MORNING_HOME&&D().MORNING_HOME.classmate_peishan===SP.home.classmate_peishan&&D().morningLine('classmate_peishan','home')===SP.home.classmate_peishan&&D().morningLine('classmate_peishan','rent')===SP.own.classmate_peishan,J([D().MORNING_HOME,D().morningLine&&D().morningLine('classmate_peishan','home')]));
    const d=STORY.dayOfKey('2027-08-14'); fresh(d-1,20,{dating_classmate_peishan:true}); setRel('classmate_peishan',S6);
    const r=await trip({who:'classmate_peishan',locs:['D26'],day:d,transport:'hsr'},['草悟道','國立臺灣美術館','審計新村','市民廣場']);
    check('14. B2：沛珊放榜後在台中老家（2027-08-14～15）約 D26：晚上「她回家」那一句、早上「'+SP.home.classmate_peishan+'」（不借 D28 那句）',!!r.t&&r.r==='go'&&r.L.includes(SP.night.home)&&r.L[r.L.indexOf(SP.narr)+1]===SP.home.classmate_peishan&&!r.L.includes(SP.own.classmate_peishan),r.L.join(' | ')); });
  await sec('14b',async()=>{
    // B7：D30 看星星只在第一天的第二個點、演完至少到 20:00；第二天不列
    fresh(sat-1,20,{}); setRel('heroine_03',S6);
    const r=await trip({who:'heroine_03',locs:['D30'],day:sat,transport:'rail'},['礫石海灘的浪邊','看星星','海岸自行車道','海邊的小攤']);
    const o1=opts.find(o=>o.includes('今天先到這裡'))||[], o2=opts.filter(o=>o.includes('今天先到這裡'))[1]||[], o3=opts.find(o=>o.includes('差不多了，回去吧'))||[], iN=said.findIndex(x=>x.t===SP.night.single);
    check('14. B7：D30「看星星」第一天第一個點不列、第二個點才列；第二天不列',!o1.includes('看星星')&&o2.includes('看星星')&&!o3.includes('看星星')&&J(r.t&&r.t.spots)===J(['D30.pebble','D30.stars','D30.bike','D30.stall']),J([o1,o2,o3,r.t&&r.t.spots]));
    check('14. B7：看星星演完至少到 20:00，接晚上那一句',iN>0&&said[iN].day===sat&&said[iN].h>=20,J(said[iN]));
    // 第一天只走一個點就「今天先到這裡」＝夕陽那一趟就沒有了，第二天不補
    fresh(sat-1,20,{}); setRel('heroine_03',S6);
    const r2=await trip({who:'heroine_03',locs:['D28'],day:sat,transport:'hsr'},['文學館的大廳','今天先到這裡','安平的老巷','館前的圓環綠地']);
    const p2=opts.find(o=>o.includes('差不多了，回去吧'))||[];
    check('14. B7：第一天只走一個點就「今天先到這裡」：第二天不補夕陽',!!r2.t&&r2.t.status==='done'&&!p2.includes('海堤的夕陽')&&!r2.t.spots.includes('D28.sunset'),J([p2,r2.t&&r2.t.spots]));
    // D32 自己一趟：雲海只在第二天的第一個點
    fresh(sat-1,20,{}); setRel('heroine_03',S6);
    const r3=await trip({who:'heroine_03',locs:['D32'],day:sat,transport:'car'},['大草原','高山步道','山上的小攤','觀景台看雲海']);
    const q1=opts.filter(o=>o.includes('今天先到這裡')), q2=opts.filter(o=>o.includes('差不多了，回去吧'));
    check('14. B7：D32「觀景台看雲海」第一天兩個點都不列；第二天第一個點才列（第一個點選了別的，第二個點就沒有了）',q1.length===2&&q1.every(o=>!o.includes('觀景台看雲海'))&&q2.length===1&&q2[0].includes('觀景台看雲海')&&!!r3.t&&J(r3.t.spots)===J(['D32.meadow','D32.trail','D32.stall']),J([q1,q2,r3.t&&r3.t.spots]));
    fresh(sat-1,20,{}); setRel('heroine_03',S6);
    const r4=await trip({who:'heroine_03',locs:['D32'],day:sat,transport:'car'},['大草原','高山步道','觀景台看雲海','山上的小攤']);
    const q3=opts.find(o=>o.includes('差不多了，回去吧'))||[];
    check('14. B7：D32 第二天第一個點列雲海、選得到',q3.includes('觀景台看雲海')&&!!r4.t&&J(r4.t.spots)===J(['D32.meadow','D32.trail','D32.cloud','D32.stall']),J([q3,r4.t&&r4.t.spots])); });
  await sec('14c',async()=>{
    // 5-2：D26～D32 時間不對的九句（只改引號裡的字；date_lines.js 由 import_date_lines.py 疊上去）
    const bad=[]; const texts=(x,o)=>{ if(Array.isArray(x)) x.forEach(v=>texts(v,o)); else if(x&&typeof x==='object'){ if(typeof x.text==='string') o.push(x.text); for(const k in x) if(k!=='text') texts(x[k],o); } return o; };
    for(const f of SP.fix52){ const T=texts((((DATE_LINES.loc[f.loc]||{}).lines||{})[f.who]),[]); if(T.includes(f.old)) bad.push(f.loc+' '+f.who+' 還有舊句：'+f.old); if(!T.includes(f.neu)) bad.push(f.loc+' '+f.who+' 沒有新句：'+f.neu); }
    check('14. 5-2：九句都換成「改成」那一欄（只在那個地點、那個人；舊句不見了）',SP.fix52.length===9&&!bad.length,bad.join('；'));
    check('14. 5-2：date_lines.js 的來源寫著 AA_359@'+SPEC_SHA,DATE_LINES.source.includes('AA_359_兩天一夜的約會_住宿那一段.md@'+SPEC_SHA),DATE_LINES.source.slice(-200)); });
  await sec('14d',async()=>{
    // 5-3（fb5156ab）：離開那一句在第二天白天說（七句改字、子晴一句）；兩個到達句另一版（DATE.ARRIVE_VAR）
    const texts=(x,o)=>{ if(Array.isArray(x)) x.forEach(v=>texts(v,o)); else if(x&&typeof x==='object'){ if(typeof x.text==='string') o.push(x.text); for(const k in x) if(k!=='text') texts(x[k],o); } return o; };
    const bad=[]; for(const f of SP.fix53.concat(SP.var53.zq?[{loc:'D32',who:'heroine_04',old:SP.var53.zq.old,neu:SP.var53.zq.neu}]:[])){ const T=texts((((DATE_LINES.loc[f.loc]||{}).lines||{})[f.who]),[]); if(T.includes(f.old)) bad.push(f.loc+' '+f.who+' 還有舊句：'+f.old); if(!T.includes(f.neu)) bad.push(f.loc+' '+f.who+' 沒有新句：'+f.neu); }
    check('14. 5-3：離開句七句＋子晴「車上我睡了一路。山路好彎。」都換了（舊句不見了）',SP.fix53.length===7&&!!SP.var53.zq&&!bad.length,bad.join('；')||J(SP.fix53.length));
    const V=D().ARRIVE_VAR||[], vps=V.find(v=>v.loc==='D28'&&v.who==='classmate_peishan'), vkx=V.find(v=>v.loc==='D32'&&v.who==='kexin');
    check('14. 5-3：兩個到達句另一版逐字照稿（沛珊住臺南的 D28、D31＋D32 同一趟可昕到清境）',!!vps&&J(vps.to)===J(SP.var53.ps)&&J(vps.from)===J(SP.var53.psOld)&&!!vkx&&vkx.to[0]===SP.var53.kx&&vkx.from[0]===SP.var53.kxOld,J({vps,vkx,sp:SP.var53}));
    const L28=(((DATE_LINES.loc.D28||{}).lines||{}).classmate_peishan||{}).arrive.first, t28={who:'classmate_peishan',locs:['D28'],day:STORY.dayOfKey('2027-10-16')};
    fresh(t28.day-1,20,{}); const w0=D().whereOn; D().whereOn=()=>({city:'台南',own:'rent'}); const a=D().arriveVar(G,t28,L28,{}); D().whereOn=()=>({city:'台北'}); const b=D().arriveVar(G,t28,L28,{}); D().whereOn=w0;
    check('14. 5-3：沛珊住臺南（她那天在租的地方）＝「歡迎來臺南！今天我帶路。」那一組；還沒搬去＝原句',J(a.lines.map(x=>x.text))===J(SP.var53.ps)&&J(b.lines.map(x=>x.text))===J(SP.var53.psOld),J([a.lines,b.lines]));
    const L32=(((DATE_LINES.loc.D32||{}).lines||{}).kexin||{}).arrive.first, t32={who:'kexin',locs:['D32'],day:STORY.dayOfKey('2027-10-17')};
    const c=D().arriveVar(G,t32,L32,{combo:true}), e=D().arriveVar(G,t32,L32,{});
    check('14. 5-3：D31＋D32 同一趟可昕到清境＝「'+SP.var53.kx+'」、下一句不變；只去清境照原句',c.lines[0].text===SP.var53.kx&&c.lines[1].text===L32.lines[1].text&&e.lines[0].text===SP.var53.kxOld,J([c.lines,e.lines])); });
  await sec('15',async()=>{
    // BB 10-21 22:54：讀「到達」那次強制存檔以後選「改時間」，q.arrived 要清掉（不然之後不會趕不上、出發車程 0）；摘要的回程寫「最晚」
    const src=fs.readFileSync(path.join(ROOT,'src/date3d.js'),'utf8'), mv=src.slice(src.indexOf('S.move=async function'),src.indexOf('改時間她回一句'));
    check('15. 改時間的三種改法都清掉 q.arrived',(mv.match(/delete q\.arrived;/g)||[]).length===3,String((mv.match(/delete q\.arrived;/g)||[]).length));
    check('15. 兩天一夜的摘要、時間選單寫「最晚」回到台大（第二天兩個點走完就回，大約中午到下午）',/住一晚，'\+S\.dayLabel\(G,w\.day\+1\)\.trim\(\)\+' 最晚約 /.test(src)&&/住一晚，第二天最晚/.test(src)); });
  console.log(fails?'\nFAILED '+fails:'\nALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
