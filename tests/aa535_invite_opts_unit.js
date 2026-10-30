// AA_535（INVITE-OPTS-1030，AA-B 定稿，企劃線 dbd49dca7）第一份：學姊的邀約上限、選單分類名稱、慢讀咖啡（常客、旁白、當邀約地點七位全套）。不需要瀏覽器。
// 用法：node tests/aa535_invite_opts_unit.js（稿用 git show 讀，台詞逐字對稿）。測試清單照稿第 5 節：
//   七位各約一次慢讀（第一次＋第二次）；學姊第 5 週連約兩次（都答應）、第 11 週同一週約兩次（第二次婉拒）、第 15 週約 Café（婉拒→「那一起念書。」→約到總圖或慢讀）；
//   晚上在 Café 找學姊，選單有「約她去…」；週二約慢讀：系統說週二休；經濟系那一年：選單沒有慢讀。另外：分類名稱、出去玩第二層、她說過想去的、常客作息與招呼、讀書旁白、路人。
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..'), GIT=process.env.SPEC_GIT_DIR||ROOT, SPEC_SHA='dbd49dca7', SPEC_PATH='docs/story_planning/AA_535_約她選項_分層與新地點_第一份_慢讀咖啡_學姊上限_分類名稱.md';
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:'?noriders'};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INVITE_REPLIES|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|NEEDED_MSGS|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|HOMETOWN_LINES|HV|DATE|DATE_DATA|DATE_LINES|CONFESS_LINES|TERMEND|TERMEND_LINES|VAC|VAC_DATA|FREE_TRIPS|TRIP|ENCOUNTERS|ENC_WALK|ENC|DORM_ROOM|SISG|SLOWREAD)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0},userData:{},add(){}});
global.CHAR={setExpr(){},build:()=>mkObj()};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+String(info).slice(0,700):'')); if(!ok) fails++; };
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/data/invite_replies.js','src/invites3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/msg3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/romance3d.js',
  'src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/sis_grad3d.js',
  'src/data/dorm_room_layout.js','src/story3d.js','src/classes3d.js','src/slowread3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
const D=k=>STORY.dayOfKey(k), wdOf=d=>CALENDAR.dateOf(d).wd%7, TD=(t,w,wd)=>STORY.termDay(t,w,wd);
let G=null, said=[], picks=[], opts=[], full=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const J=x=>JSON.stringify(x);
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(n){ G.money+=n; },setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },
  choose:async o=>{ const T=o.map(q=>q.t||q.text); opts.push(T); full.push(o); if(opts.length>80) throw new Error('選項一直重來：'+J(opts.slice(-3))); if(picks.length){ const w=picks[0]; if(typeof w==='number'){ picks.shift(); return w; } const k=T.findIndex(x=>w instanceof RegExp?w.test(x):x.includes(w)); if(k>=0){ picks.shift(); return k; } } return o.length-1; }};
const fresh=(day,hour,flags,stage)=>{ G={v:3,stage:stage||'law',day,hour,zone:'dorm',weekday:wdOf(day),weather:'clear',energy:70,money:50000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,afternoonDone:true,classDone:true,introDone:true,metAn:true,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,contacts:{},invites:[],trips:[],stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; picks=[]; opts=[]; full=[]; GM.npc={}; if(STORY._fy) STORY._fy.reset(); return G; };
const S4={fam:30,trust:20,comf:15,npcRom:10,rom:0}, S5={fam:45,trust:30,comf:20,npcRom:35,rom:10}, S6={fam:60,trust:45,comf:40,npcRom:55,rom:30};
const know=(id,rel)=>{ SOCIAL.remember(id,'FIRST_MET',''); Object.assign(SOCIAL.rel(id),rel); G.contacts[id]=1; };
const T=()=>said.map(s=>s.t);
const ask=async(id,pk,n,together)=>{ said=[]; opts=[]; full=[]; picks=pk||[]; let r=null, err=null; try{ r=await INV.flow(GM,id,n||null,!!together); }catch(e){ err=String(e&&e.stack||e); } return {r,err,opts:opts.slice(),full:full.slice(),L:T().concat(err?['（例外）'+err]:[])}; };
const band=id=>['FRIEND','CLOSE_FRIEND'].includes(SOCIAL.friendLevel(id))?'R':'A';
(async()=>{
  // ===== 0. 稿 =====
  let spec=''; try{ spec=cp.execSync('git show '+SPEC_SHA+':"'+SPEC_PATH+'"',{cwd:GIT,encoding:'utf8',maxBuffer:8<<20,stdio:['ignore','pipe','ignore']}); }catch(e){}
  check('0. 讀得到稿 AA_535@'+SPEC_SHA,!!spec&&/慢讀咖啡/.test(spec),spec.slice(0,40).replace(/\n/g,' '));
  { const al=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>e.path===SPEC_PATH);
    check('0. 匯入白名單：'+SPEC_PATH.split('/').pop()+' 一筆 approved＝'+SPEC_SHA+'（INVITE-OPTS-1030）',al.length===1&&al[0].sha===SPEC_SHA&&al[0].status==='approved'&&al[0].task==='INVITE-OPTS-1030'&&!!al[0].approvedBy,J(al.map(e=>[e.sha,e.status,e.task]))); }
  const inSpec=t=>!spec||spec.includes(String(t).replace(/^「|」$/g,'').replace(/^（|）$/g,''));
  /* AA_535b 第 4 節（企劃線 b3e5bca3b）更正 AA_535 4-2 語彤的 walk（H8 在滇香小館）：慢讀台詞也認那一節 */
  let spec4=''; try{ spec4=cp.execSync('git show b3e5bca3b:"docs/story_planning/AA_535b_約她選項_第二份_缺的台詞_法圖_映月湖.md"',{cwd:GIT,encoding:'utf8',maxBuffer:8<<20,stdio:['ignore','pipe','ignore']}); }catch(e){} spec4=spec4.slice(Math.max(0,spec4.indexOf('## 4.')));
  const inSpecSR=t=>inSpec(t)||(!!spec4&&spec4.includes(String(t).replace(/^「|」$/g,'').replace(/^（|）$/g,'')));
  { const SR=INVITE_DATA.slowreadLines||{}, all=[]; for(const id in SR) for(const k in SR[id]){ const v=SR[id][k]; const L=typeof v==='function'?v(null,{r:{}})||[]:(Array.isArray(v)?v:[].concat(v.A||[],v.R||[])); for(const x of L) all.push(typeof x==='string'?x:[].concat(x.l||[]).join('')); }
    const bad=[]; for(const id in SR) for(const k in SR[id]){ const v=SR[id][k]; let L=typeof v==='function'?v(null,{r:{}})||[]:(Array.isArray(v)?v:[].concat(v.A||[],v.R||[])); for(const x of L){ for(const t of (typeof x==='string'?[x]:(x.l||[]))) if(!inSpecSR(t)) bad.push(id+'.'+k+':'+t); } }
    check('0. 七位的慢讀台詞（first／acc／plan／here／firstAt／walk）每一句都在稿上（一字照稿；語彤的 walk 照 AA_535b 4-1 更正）',Object.keys(SR).length===7&&bad.length===0&&all.length>50,J(bad));
    const M=[]; for(const id of Object.keys(SR)){ const m=((REL_LINES[id]||{}).meet||{}).slowread||{}; for(const k of ['A','F','R']) if(!m[k]||!inSpec(m[k])) M.push(id+'.'+k); }
    check('0. 見面旁白 meet.slowread（A／F／R）七位都有、照稿',M.length===0,J(M));
    const sg=[SISG.STUDY_YES].concat(SISG.DECLINE_OFF,SISG.STUDY_OPTS,SLOWREAD.NARR,SLOWREAD.REGULARS.map(r=>r.hi)).filter(t=>!inSpec(t));
    check('0. 學姊兩句婉拒、那一起念書、答應句、慢讀旁白四句、常客招呼照稿',sg.length===0,J(sg)); }
  // ===== 1. 七位各約一次慢讀（第一次＋第二次）=====
  const IDS=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'], P=INV.place('slowread');
  check('1. 慢讀咖啡是邀約地點：念書＋喝咖啡、喝茶兩類、有點熟以下（reason）、一個半小時、週二休、只在法律系',!!P&&P.zone==='l118_cafe2'&&J(INV.catsOf(P))===J(['study','sit'])&&P.kind==='reason'&&P.minStage==='ACQUAINTANCE'&&P.stay===1.5&&J(P.off)===J([2])&&P.show({stage:'law'})&&!P.show({stage:'econ'}),J(P));
  const sun=TD('Y1S2',4,7);   /* 週日（termDay 的星期 1～7）*/
  for(const id of IDS){ fresh(sun,9,id==='kexin'?{dating_kexin:true}:{}); know(id,id==='kexin'?S6:S4); const SR=INVITE_DATA.slowreadLines[id];
    let slot=null, day=sun; for(const h of [10,14]) if(slot==null&&INV.freeAt(G,id,P,sun,h)) slot=h; if(slot==null){ const a=INV.nextFree(G,id,P,sun,10); if(a){ slot=a.h; day=a.day; } }
    const d1=INV.personal(G,id,P,day,slot,INV.decide(G,id,'slowread',day,slot));
    const iv=INV.accept(G,id,'slowread',day,slot,{by:'player'});
    said=[]; await INV.meet(GM,iv,null); const L1=T();
    const n2=INV.nextFree(G,id,P,day+1,10)||{day:day+7,h:slot}, d2=INV.personal(G,id,P,n2.day,n2.h,INV.decide(G,id,'slowread',n2.day,n2.h));   /* 第二次：之後第一個她有空的時間 */
    const want=SR.acc[band(id)];
    check('1. '+id+' 第一次約慢讀（'+CALENDAR.dateOf(day).m+'/'+CALENDAR.dateOf(day).d+' '+slot+'）：答應、念 first',d1.res==='accept'&&J(d1.lines)===J(SR.first),J([d1.res,d1.why,d1.lines]));
    check('1. '+id+' 見面：第一次到這裡多說的（firstAt）＋見面旁白（meet '+band(id)+'）',SR.firstAt.every(t=>L1.some(x=>x===t))&&L1.includes(SOCIAL.meetLine(id,'slowread'))&&iv.state==='done',J(L1));
    check('1. '+id+' 第二次：照 acc '+band(id),d2.res==='accept'&&J(d2.lines)===J(want),J([d2.res,d2.why,d2.lines])); }
  // ===== 2. 學姊的上限 =====
  { const w5a=TD('Y1S1',5,2), w5b=TD('Y1S1',5,4); fresh(w5a,9,{met_sis:true}); know('heroine_05',S4);
    const r1=INV.personal(G,'heroine_05',INV.place('cafe'),w5a,17.5,INV.decide(G,'heroine_05','cafe',w5a,17.5)); if(r1.res==='accept') INV.accept(G,'heroine_05','cafe',w5a,17.5,{by:'player'});
    const r2=INV.personal(G,'heroine_05',INV.place('cafe'),w5b,17.5,INV.decide(G,'heroine_05','cafe',w5b,17.5));
    check('2. 學姊第 5 週連約兩次 Café（週二、週四 17:30）：都答應（第 1～9 週不設上限）',r1.res==='accept'&&r2.res==='accept',J([r1,r2].map(r=>[r.res,r.why,r.lines]))); }
  { const a=TD('Y1S1',11,2), b=TD('Y1S1',11,4); fresh(a,9,{met_sis:true}); know('heroine_05',S4);
    const r1=INV.personal(G,'heroine_05',INV.place('cafe'),a,17.5,INV.decide(G,'heroine_05','cafe',a,17.5)); if(r1.res==='accept') INV.accept(G,'heroine_05','cafe',a,17.5,{by:'player'});
    const r2=INV.personal(G,'heroine_05',INV.place('cafe'),b,17.5,INV.decide(G,'heroine_05','cafe',b,17.5));
    const lib=INV.personal(G,'heroine_05',INV.place('library'),b,19,INV.decide(G,'heroine_05','library',b,19));
    check('2. 第 11 週同一週約兩次：第一次答應、第二次婉拒（四句輪流的一句）',r1.res==='accept'&&r2.res==='decline'&&SISG.DECLINE.includes((r2.lines||[])[0])&&!r2.study,J([r1.res,r2.res,r2.lines]));
    const nx=INV.personal(G,'heroine_05',INV.place('cafe'),TD('Y1S1',12,2),17.5,INV.decide(G,'heroine_05','cafe',TD('Y1S1',12,2),17.5));
    check('2. 第 12 週（下一週）：又可以約一次（一週一次，原本兩週一次）',nx.res==='accept',J([nx.res,nx.lines]));
    check('2. 念書（總圖）不算次數：同一週照樣答應',lib.res==='accept'||lib.res==='here',J([lib.res,lib.lines]));
    // 校外：只列半天的、和校內共用那一週的一次
    G.day=a; G.hour=10; G.weekday=wdOf(a); Object.assign(SOCIAL.rel('heroine_05'),S5); G.flags.dating_heroine_05=true;
    check('2. 校外（第 10～13 週）：不婉拒、只能約半天（S.halfOnly）',!SISG.dateDecline(G)&&SISG.halfOnly(G));
    const cw=SISG.tripWhy(G,{who:'heroine_05',day:b,depart:14,kind:'half'}), cd=SISG.tripWhy(G,{who:'heroine_05',day:TD('Y1S1',12,6),depart:9,kind:'day'}), cn=SISG.tripWhy(G,{who:'heroine_05',day:TD('Y1S1',12,6),depart:14,kind:'half'});
    check('2. 校外和校內共用那一週的一次：第 11 週已經約過 Café＝「這週已經約過她了」；一日遊＝「考試前只能約半天」；第 12 週半天＝可以',cw==='這週已經約過她了'&&cd==='考試前只能約半天'&&cn==='',J([cw,cd,cn]));
    const dk=DATE.check(G,{who:'heroine_05',locs:['D13'],transport:'mrt',day:b,depart:14});
    check('2. DATE.check 也擋（同一週已經約過）',!dk.ok&&dk.why==='這週已經約過她了',J(dk)); }
  { const w15=TD('Y1S1',15,2); fresh(w15,10,{met_sis:true}); know('heroine_05',S4);
    const a=await ask('heroine_05',['喝咖啡','兩點半','明天 19:00','那一起念書。']); const iv=(G.invites||[]).slice(-1)[0]||{};
    check('2. 第 15 週約 Café：婉拒（換成兩句裡的一句）→「那一起念書。」／「不用了。」',a.L.some(t=>SISG.DECLINE_OFF.includes(t))&&a.opts.some(o=>J(o)===J(['那一起念書。','不用了。'])),J([a.L,a.opts.slice(-2)]));
    check('2. 選「那一起念書。」：平日＝同一個時間約到總圖、她說「好。我帶刑訴。……」',iv.who==='heroine_05'&&iv.place==='library'&&iv.state==='accepted'&&iv.by==='player'&&iv.day===w15+1&&iv.h===19&&a.L.includes(SISG.STUDY_YES),J([iv,a.L]));
    const sat=TD('Y1S1',15,6); fresh(sat-1,10,{met_sis:true}); know('heroine_05',S4);
    const b=await ask('heroine_05',['喝咖啡','兩點半','明天 12:10','那一起念書。']); const iv2=(G.invites||[]).slice(-1)[0]||{};
    check('2. 週末（週六 12:10）：約到慢讀咖啡',iv2.place==='slowread'&&iv2.day===sat&&b.L.includes(SISG.STUDY_YES),J([iv2,b.L]));
    fresh(w15,10,{met_sis:true}); know('heroine_05',S4); const c=await ask('heroine_05',['喝咖啡','兩點半','明天 19:00','不用了。']);
    check('2. 選「不用了。」：什麼都不發生',!(G.invites||[]).length,J(G.invites));
    const sr=INV.personal(G,'heroine_05',P,TD('Y1S1',15,6),10,INV.decide(G,'heroine_05','slowread',TD('Y1S1',15,6),10));
    check('2. 第 15 週約慢讀（念書）：照常答應、念「好。我帶刑訴。……」',sr.res==='accept'&&J(sr.lines)===J([SISG.STUDY_YES]),J([sr.res,sr.lines]));
    G.hour=10; check('2. 第 14 週起校外照舊婉拒（S.dateDecline）',SISG.dateDecline(G)); }
  // ===== 3. 晚上在 Café 找學姊：選單有「約她去…」 =====
  { fresh(TD('Y1S2',3,2),20,{met_sis:true}); G.zone='cafe'; know('heroine_05',S4); const n={obj:mkObj(),name:'溫學姊'};
    try{ picks=[]; await STORY._v1.talkSis(GM,n); }catch(e){} said=[]; opts=[]; picks=[0,'算了']; let err=null; try{ await STORY._v1.talkSis(GM,n); }catch(e){ err=String(e); }
    check('3. 晚上在兩點半找學姊：便條照舊，演完的選單有「約她去…」',said.some(s=>/便條/.test(s.t))&&opts.some(o=>o.includes('約她去…')),J(opts)+(err||'')); }
  // ===== 4. 週二約慢讀：系統說週二休 =====
  { const mon=TD('Y1S2',4,1); fresh(mon-6,10); know('heroine_01',S4);
    const tue=mon+1, r=INV.decide(G,'heroine_01','slowread',tue,15.5), t=INV.reply(G,'heroine_01','slowread',r);
    check('4. 週二約慢讀：約不成（closed），系統說「慢讀咖啡週二休。」',r.res==='resched'&&r.why==='closed'&&/^慢讀咖啡週二休。/.test(t),J([r,t]));
    const a=await ask('heroine_01',['念書','慢讀','其他日子',/（週二）$/,'15:30','換一天','返回','算了']); const tl=a.full.find(o=>o.some(x=>x.t==='15:30'&&x.dim))||[];
    check('4. 其他日子選週二：時間都灰掉、小字「慢讀咖啡週二休」；選了說一樣的話',tl.length&&tl.filter(x=>x.t!=='換一天').every(x=>x.dim&&x.hint==='慢讀咖啡週二休')&&a.L.includes('慢讀咖啡週二休。'),J([tl,a.L]));
    const wk=INV.timesOf(G,P,mon), we=INV.timesOf(G,P,TD('Y1S2',4,6));
    check('4. 時間：平日 12:10、15:30；週末多 10:00、14:00',J(wk)===J([12+10/60,15.5])&&J(we)===J([10,12+10/60,14,15.5]),J([wk,we]));
    check('4. 最晚 16:30 開始（18:00 關、坐一個半小時）',INV.slotOpen(G,P,mon,16.5)&&!INV.slotOpen(G,P,mon,17)&&!INV.slotOpen(G,P,mon,8.5)); }
  // ===== 5. 經濟系那一年：選單沒有慢讀 =====
  { const d=D('2024-10-07'); fresh(d,10,{},'econ'); check('5. 經濟系那一年：慢讀不列（show）',!P.show(G));
    const ok=INVITE_DATA.places.filter(Q=>!Q.show||Q.show(G,'kexin')).map(Q=>Q.id); check('5. 經濟系那一年的地點清單沒有 slowread',!ok.includes('slowread'),J(ok)); }
  // ===== 6. 分類名稱（第 2 節）=====
  { const mon=TD('Y1S2',4,1); fresh(mon,10); know('heroine_01',{fam:10,trust:4,comf:2,npcRom:0,rom:0});
    const a=await ask('heroine_01',['算了']); const f=a.full[0]||[];
    check('6. 第一層：念書…／吃飯…／喝咖啡、喝茶…／散步…（溫州街、映月湖，AA_535b）／運動…／出去玩…／算了',J(f.map(o=>o.t))===J(['念書…','吃飯…','喝咖啡、喝茶…','散步…','運動…','出去玩…','算了']),J(f.map(o=>o.t)));
    const out=f.find(o=>o.t==='出去玩…')||{}, walk=f.find(o=>o.t==='散步…')||{}, meal=f.find(o=>o.t==='吃飯…')||{};
    check('6. 出去玩：不寫「約會」',!/約會/.test(out.t+out.hint),J(out));
    check('6. 沒開的分類照樣列出、反灰、小字寫原因（散步要等你們變成朋友。／吃飯的原因）',walk.dim&&walk.hint==='散步要等你們變成朋友。'&&meal.dim&&meal.hint==='再熟一點，才約得出去吃飯。',J([walk,meal])); }
  { const d=TD('Y1S2',4,6); fresh(d-1,10); know('heroine_01',S5); DATE.knowWish(G,'heroine_01'); const wk=DATE.wishOf('heroine_01');
    const a=await ask('heroine_01',['出去玩','算了']); const L2=a.opts[1]||[];
    check('6. 出去玩第二層：她說過想去的（她說過心願＝那個地點直接列在最前面）、臺北市、新北市、桃園、一整天',!!wk&&L2[0]===DATE.loc(wk).name&&L2.includes('臺北市：看展・電影…')&&L2.includes('新北市、桃園：海邊…')&&L2.includes('一整天（宜蘭、中南部）…'),J([wk,L2])); }
  { const d=TD('Y3S1',6,4); fresh(d,21.5,{PS_BACK_FIRST:1,dating_classmate_peishan:true}); know('classmate_peishan',S6);
    const a=await ask('classmate_peishan',['這個時候才有','返回','算了']); const O=a.opts[0]||[];
    check('6. 這個時候才有：去她的城市、視訊兩個都有＝一類（沛珊交往中、她在台南、晚上）',O.includes('這個時候才有…')&&J(a.opts[1])===J(['我去台南找妳？','視訊？','返回']),J(a.opts.slice(0,2))); }
  // ===== 7. 慢讀的常客（3-1）、招呼、旁白、路人 =====
  { const at=(id,day,h)=>{ const g=Object.assign({},G,{day,hour:h,weekday:wdOf(day),invites:[]}); const e=STORY.schedEnt(CHARACTERS[id],g); return e&&e.zone; };
    fresh(TD('Y1S2',4,1),9);
    const r=[['heroine_01',TD('Y1S2',5,6),15],['heroine_03',TD('Y2S1',5,1),15],['classmate_xinci',TD('Y1S1',5,4),16],['pool_17',TD('Y1S2',5,5),11]].map(([id,d,h])=>[id,at(id,d,h)]);
    check('7. 常客作息：以安大一下週六 15:00、語彤大二上週一 15:00、芯慈大一上週四 16:00、乃文大一下週五 11:00＝在慢讀',r.every(x=>x[1]==='l118_cafe2'),J(r));
    const no=[['heroine_01',TD('Y1S1',5,6),15],['heroine_01',TD('Y4S1',5,6),15],['heroine_03',TD('Y1S2',5,1),15],['classmate_xinci',TD('Y3S1',5,4),16]].map(([id,d,h])=>[id,at(id,d,h)]);
    check('7. 不在那幾個學期的不排（以安大一上照 H3、大四；語彤大一下；芯慈大三）',no.every(x=>x[1]!=='l118_cafe2'),J(no));
    check('7. 學姊不排',!(CHARACTERS.heroine_05.daily_schedule||[]).some(e=>e&&e.zone==='l118_cafe2'));
    const s=TD('Y1S2',5,6); fresh(s-2,10); know('heroine_01',S4); const hr=INV.personal(G,'heroine_01',P,s,14,INV.decide(G,'heroine_01','slowread',s,14));
    check('7. 以安常客時段（週六 14:00）約慢讀＝她本來就在（here）：「我已經在慢讀了。窗邊。」',hr.res==='here'&&J(hr.lines)===J(['「我已經在慢讀了。窗邊。」']),J([hr.res,hr.lines]));
    fresh(s,15); G.zone='l118_cafe2'; know('heroine_01',S4); said=[]; const w={name:'沈以安'};
    const g1=await SLOWREAD.greet(GM,w,'heroine_01'), g2=await SLOWREAD.greet(GM,w,'heroine_01'); const L=T();
    G.day=TD('Y2S1',6,6); G.weekday=6;   /* 大二上第 6 週週六（第 5 週週六是 10/10 國定假日）*/ said=[]; const g3=await SLOWREAD.greet(GM,w,'heroine_01');
    check('7. 招呼：常客時段在慢讀點她＝第一句「你也來慢讀？窗邊那張我先坐了。」，一學期一次、下一學期再一次',g1&&!g2&&g3&&J(L)===J(['「你也來慢讀？窗邊那張我先坐了。」']),J([g1,g2,g3,L]));
    G.zone='l118_cafe2'; const n4=[0,1,2,3,4].map(()=>STORY.studyNarr(GM)); G.zone='cafe'; const nc=STORY.studyNarr(GM);
    check('7. 玩家在慢讀讀書：旁白四句輪流（原本 done 那一句也在）；別的地方沒有',J(n4.slice(0,4))===J(SLOWREAD.NARR)&&n4[4]===SLOWREAD.NARR[0]&&SLOWREAD.NARR.includes('（你多坐了一會兒，把上午的筆記看完。）')&&nc==null,J(n4));
    const seats=[0,1,2,3,4,5,6].map(i=>({x:i,z:0,yaw:0,lv:0})).concat([{x:9,z:0,yaw:0,lv:0,lift:0.31}]), added=[];
    const E2={zone:{seats},npcs:[],player:{seat:null},addNPC(o){ added.push(o); this.npcs.push(o); return o; }};
    fresh(TD('Y1S2',5,3),14); G.zone='l118_cafe2'; const k=SLOWREAD.addExtras({G,E:E2}), k2=SLOWREAD.addExtras({G,E:E2});
    check('7. 路人兩到三位：坐桌位看書、不說話（沒有名字）、不坐吧檯、至少留兩個桌位；同一次不重複補',k>=2&&k<=3&&k2===0&&added.every(o=>o.name===''&&o.pose==='read'&&!o.seat.lift)&&seats.filter(st=>!st.lift&&!added.some(o=>o.seat===st)).length>=2,J([k,k2]));
    const E3={zone:{seats},npcs:[],player:{seat:null},addNPC(o){ this.npcs.push(o); return o; }}; fresh(TD('Y1S2',5,2),14); G.zone='l118_cafe2';
    check('7. 週二（公休）沒有路人',SLOWREAD.addExtras({G,E:E3})===0); }
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });
