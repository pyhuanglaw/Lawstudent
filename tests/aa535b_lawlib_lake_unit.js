// AA_535b（INVITE-OPTS-1030 第二份，AA-B 定稿，企劃線 2dbcc5691）：缺的台詞（以安、語彤、可昕的 meet；可昕的 bye；以安、語彤校外的 depart／enough／leaveEarly／noPair）、
// 新的校內地點法圖（法律學院圖書館）、映月湖。不需要瀏覽器。用法：node tests/aa535b_lawlib_lake_unit.js（稿用 git show 讀，台詞逐字對稿）。測試清單照稿第 3 節：
//   七位各約一次法圖、一次映月湖（第一次＋第二次）；可昕約法圖 → 改約慢讀（週二慢讀休 → 系統改天）；芷若認識階段約法圖 → 婉拒；有伴侶約映月湖 → 系統說明；
//   學姊筆試前約映月湖 → 婉拒；以安、語彤校外約會走完三個點 → enough。
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..'), GIT=process.env.SPEC_GIT_DIR||ROOT, SPEC_SHA='2dbcc5691', SPEC_PATH='docs/story_planning/AA_535b_約她選項_第二份_缺的台詞_法圖_映月湖.md';
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
const S2={fam:12,trust:6,comf:3,npcRom:0,rom:0}, S4={fam:30,trust:20,comf:15,npcRom:10,rom:0}, S6={fam:60,trust:45,comf:40,npcRom:55,rom:30};
const know=(id,rel)=>{ SOCIAL.remember(id,'FIRST_MET',''); Object.assign(SOCIAL.rel(id),rel); G.contacts[id]=1; };
const T=()=>said.map(s=>s.t);
const ask=async(id,pk)=>{ said=[]; opts=[]; full=[]; picks=pk||[]; let r=null, err=null; try{ r=await INV.flow(GM,id,null,false); }catch(e){ err=String(e&&e.stack||e); } return {r,err,opts:opts.slice(),full:full.slice(),L:T().concat(err?['（例外）'+err]:[])}; };
const band=id=>['FRIEND','CLOSE_FRIEND'].includes(SOCIAL.friendLevel(id))?'R':'A', lvK=id=>({FRIEND:'R',CLOSE_FRIEND:'R',FAMILIAR:'F'})[SOCIAL.friendLevel(id)]||'A';
/* 她在臺北、那個時間有空的第一個時段（沛珊週末常回台中：AA_372 第 7 節）*/
const pickSlot=(id,P,from,h0)=>{ for(let d=from;d<from+14;d++){ if(STORY.reachable&&!STORY.reachable(id,Object.assign({},G,{day:d}))) continue; if(INV.freeAt(G,id,P,d,h0)) return {day:d,h:h0}; const a=INV.nextFree(G,id,P,d,h0); if(a&&STORY.reachable(id,Object.assign({},G,{day:a.day}))) return a; } return {day:from,h:h0}; };
const once=async(id,pid,day,h)=>{ const P=INV.place(pid); return INV.personal(G,id,P,day,h,INV.decide(G,id,pid,day,h)); };
(async()=>{
  // ===== 0. 稿 =====
  let spec=''; try{ spec=cp.execSync('git show '+SPEC_SHA+':"'+SPEC_PATH+'"',{cwd:GIT,encoding:'utf8',maxBuffer:8<<20,stdio:['ignore','pipe','ignore']}); }catch(e){}
  check('0. 讀得到稿 AA_535b@'+SPEC_SHA,!!spec&&/映月湖/.test(spec)&&/法律學院圖書館/.test(spec));
  { const al=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>e.path===SPEC_PATH);
    check('0. 匯入白名單：'+SPEC_PATH.split('/').pop()+' 一筆 approved＝'+SPEC_SHA+'（INVITE-OPTS-1030）',al.length===1&&al[0].sha===SPEC_SHA&&al[0].status==='approved'&&al[0].task==='INVITE-OPTS-1030'&&!!al[0].approvedBy,J(al.map(e=>[e.sha,e.status,e.task]))); }
  const inSpec=t=>!spec||spec.includes(String(t).replace(/^「|」$/g,'').replace(/^（|）$/g,''));
  { const bad=[]; const walk=(tag,v)=>{ if(v==null) return; if(typeof v==='function') return walk(tag,v(null,{r:{}})); if(typeof v==='string'){ if(!inSpec(v)) bad.push(tag+':'+v); return; } if(Array.isArray(v)) return v.forEach(x=>walk(tag,x)); if(v.l) return walk(tag,v.l); for(const k in v) walk(tag+'.'+k,v[k]); };
    walk('lawlib',INVITE_DATA.lawlibLines); walk('lake',INVITE_DATA.lakeLines);
    for(const id of ['heroine_01','heroine_03','kexin']) for(const p of ['cafe','library','noodle','wenzhou']) walk('meet.'+id+'.'+p,((REL_LINES[id]||{}).meet||{})[p]);
    for(const id in REL_LINES) for(const p of ['lawlib','lake']) walk('meet.'+id+'.'+p,((REL_LINES[id]||{}).meet||{})[p]);
    walk('bye.kexin',(REL_LINES.kexin||{}).bye); walk('date',DATE.EXTRA_LINES);
    check('0. 法圖、映月湖的台詞、見面旁白、可昕的道別、以安語彤校外四格：每一句都在稿上（一字照稿）',bad.length===0&&!!INVITE_DATA.lawlibLines&&!!INVITE_DATA.lakeLines,J(bad)); }
  // ===== 1. 缺的台詞 =====
  { fresh(TD('Y1S2',4,2),10); const r=[]; for(const id of ['heroine_01','heroine_03','kexin']) for(const [lv,rel] of [['A',{fam:5}],['F',S4],['R',S6]]){ Object.assign(SOCIAL.rel(id),{fam:0,trust:0,comf:0,npcRom:0,rom:0},rel);
      for(const p of ['cafe','library','noodle','wenzhou']){ const m=REL_LINES[id].meet[p], got=SOCIAL.meetLine(id,p), want=m[lvK(id)]||null; if(got!==want) r.push([id,p,lvK(id),got,want]); } }
    check('1-1. 以安、語彤、可昕的 meet（cafe／library／noodle／wenzhou；A／F／R；「—」的格子不寫＝沒有）照階段',r.length===0,J(r));
    check('1-1. 散步只有朋友以上、語彤 Café 認識階段婉拒＝沒有那一格',!REL_LINES.heroine_01.meet.wenzhou.A&&!REL_LINES.heroine_01.meet.wenzhou.F&&!REL_LINES.heroine_03.meet.cafe.A&&!REL_LINES.kexin.meet.wenzhou.F);
    const b=[]; for(const [rel,lv] of [[{fam:5},'base'],[S4,'FAM'],[S6,'FRI']]){ Object.assign(SOCIAL.rel('kexin'),{fam:0,trust:0,comf:0,npcRom:0,rom:0},rel); b.push([SOCIAL.friendLevel('kexin'),J(SOCIAL.byeLine('kexin'))]); }
    check('1-2. 可昕的 bye：base「我回木柵了。到了傳你。」、FRIEND「下次換你來。」、CLOSE_FRIEND 那一句；沒有 up',J(REL_LINES.kexin.bye)===J({base:['「我回木柵了。到了傳你。」'],FRIEND:['「下次換你來。」'],CLOSE_FRIEND:['「走了。……送到路口就好，不用送到捷運站。」']})&&!REL_LINES.kexin.up&&b.every(x=>x[1]&&x[1]!=='null'),J(b)); }
  { const sum=TD('Y1S2',4,6), win=D('2026-02-07'); fresh(sum,10); const t={day:sum};
    const dep=[0,1,2,3].map(()=>J(DATE.lineFor(G,'heroine_01','depart',t)));
    check('1-3. 以安 depart 三則輪流',J(dep)===J(DATE.EXTRA_LINES.heroine_01.depart.concat([DATE.EXTRA_LINES.heroine_01.depart[0]]).map(x=>J([x]))),J(dep));
    const en=[0,1].map(()=>DATE.lineFor(G,'heroine_01','enough',t)[0]), enW=[0,1].map(()=>DATE.lineFor(G,'heroine_01','enough',{day:win})[0]);
    check('1-3. 以安 enough：學期中兩句輪流（「明天早上有讀書會」）；寒暑假只有另一句',en.some(x=>/讀書會/.test(x))&&enW.every(x=>!/讀書會/.test(x)),J([en,enW]));
    const yt=[0,1].map(()=>DATE.lineFor(G,'heroine_03','enough',t)[0]); const off=D('2026-02-16'); const ytOff=[0,1].map(()=>DATE.lineFor(G,'heroine_03','enough',{day:off})[0]);
    const shopOff=!(PLACES.isOpen('noodle',18,off))||STORY.presence('heroine_03',Object.assign({},G,{day:off})).here===false;
    check('1-3. 語彤 enough：麵店有開、她在臺北＝兩句輪流（「晚上我要幫阿姨」）；不然只有「走累了。回去吧。」',yt.some(x=>/幫阿姨/.test(x))&&(!shopOff||ytOff.every(x=>x==='走累了。回去吧。')),J([yt,ytOff,shopOff]));
    check('1-3. leaveEarly、noPair（以安、語彤）',J(DATE.lineFor(G,'heroine_01','leaveEarly',t))===J(['……這樣就回去了？好。手帳上寫的，下次再用。'])&&J(DATE.lineFor(G,'heroine_03','noPair',t))===J(['我不用。……我幫你拍。']));
    check('1-3. date_lines.js（匯入工具產生）有的格子照舊用它（子晴的 depart）',J(DATE.lineFor(G,'heroine_04','depart',t))===J([DATE_LINES.lines.heroine_04.depart[0]]));
    const src=fs.readFileSync(path.join(ROOT,'src/date3d.js'),'utf8');
    check('1-3. 走完三個點才說 enough（DATE.scene 原本的位置）',/if\(spots\.length===3&&pts\.length>3\) await S\.speak\(GM,t\.who,'enough',t,\{obj:null\}\)/.test(src)); }
  // ===== 2-1 法圖、2-2 映月湖：七位各約一次（第一次＋第二次）=====
  const LW=INV.place('lawlib'), LK=INV.place('lake');
  check('2. 法圖：法律學院圖書館、念書、剛認識就可以、一個半小時、開放時間照 places.js 的 lawlib',!!LW&&LW.name==='法律學院圖書館'&&LW.verb==='去法圖一起念書'&&J(INV.catsOf(LW))===J(['study'])&&LW.kind==='reason'&&LW.minStage==='ACQUAINTANCE'&&LW.stay===1.5&&LW.hoursFrom==='lawlib',J(LW));
  check('2. 映月湖：散步、朋友以上、16:00～22:00、約 17:30／19:00／21:00、下雨改 Café、在湖南岸木棧道口等',!!LK&&LK.name==='映月湖'&&INV.catOf(LK)==='walk'&&LK.minStage==='FRIEND'&&J(LK.hours)===J([16,22])&&J(LK.times)===J([17.5,19,21])&&LK.rainTo==='cafe'&&Array.isArray(LK.meetAt),J(LK));
  { const mon=TD('Y1S2',4,1); fresh(mon,8);
    check('2-1. 法圖開放時間：學期中平日 08:10 開、最晚 20:15 開始（21:45 關）；週末 09:10～17:00（最晚 15:30 開始）',INV.slotOpen(G,LW,mon,8+10/60)&&INV.slotOpen(G,LW,mon,20.25)&&!INV.slotOpen(G,LW,mon,20.5)&&INV.slotOpen(G,LW,TD('Y1S2',4,6),15.5)&&!INV.slotOpen(G,LW,TD('Y1S2',4,6),16)&&!INV.slotOpen(G,LW,TD('Y1S2',4,6),9)); }
  const IDS=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
  for(const id of IDS){ const sat=TD('Y1S2',5,6); fresh(sat-1,9,id==='kexin'?{dating_kexin:true}:{}); know(id,id==='kexin'?S6:S4);
    if(id==='kexin') continue;   /* 可昕的法圖在下面（一律改約慢讀）*/
    const L=INVITE_DATA.lawlibLines[id]; const s1=pickSlot(id,LW,sat,10), day=s1.day, h=s1.h;
    const r1=await once(id,'lawlib',day,h); const iv=INV.accept(G,id,'lawlib',day,h,{by:'player'}); said=[]; await INV.meet(GM,iv,null); const L1=T();
    const n2=pickSlot(id,LW,day+1,10), r2=await once(id,'lawlib',n2.day,n2.h);
    check('2-1. '+id+' 第一次約法圖：答應、念 first',r1.res==='accept'&&J(r1.lines)===J(L.first),J([r1.res,r1.why,r1.lines]));
    check('2-1. '+id+' 見面：firstAt＋meet（'+lvK(id)+'）',L.firstAt.every(t=>L1.includes(t))&&L1.includes(SOCIAL.meetLine(id,'lawlib')),J(L1));
    check('2-1. '+id+' 第二次：acc '+band(id)+'（芷若、子晴有點熟也是 acc R 那句）',r2.res==='accept'&&J(r2.lines)===J(L.acc[band(id)]),J([r2.res,r2.why,r2.lines])); }
  for(const id of IDS){ const sat=TD('Y1S2',5,6); fresh(sat-1,9,id==='kexin'?{dating_kexin:true}:{}); know(id,S6); const L=INVITE_DATA.lakeLines[id];
    const s1=pickSlot(id,LK,sat,17.5), day=s1.day, h=s1.h;
    const r1=await once(id,'lake',day,h); const iv=INV.accept(G,id,'lake',day,h,{by:'player'}); said=[]; await INV.meet(GM,iv,null); const L1=T();
    const n2=pickSlot(id,LK,day+1,17.5), r2=await once(id,'lake',n2.day,n2.h);
    check('2-2. '+id+' 第一次約映月湖：答應、念 first',r1.res==='accept'&&J(r1.lines)===J(L.first),J([r1.res,r1.why,r1.lines]));
    check('2-2. '+id+' 見面：firstAt＋meet R',L.firstAt.every(t=>L1.includes(t))&&L1.includes(REL_LINES[id].meet.lake.R),J(L1));
    check('2-2. '+id+' 第二次：acc',r2.res==='accept'&&J(r2.lines)===J(L.acc),J([r2.res,r2.why,r2.lines])); }
  // ===== 可昕約法圖 → 改約慢讀（週二慢讀休 → 系統改天）=====
  { const mon=TD('Y1S2',5,1); fresh(mon-2,10,{dating_kexin:true}); know('kexin',S6);
    const sat=TD('Y1S2',5,6), r=await once('kexin','lawlib',sat,10);
    check('2-1. 可昕約法圖（週六 10:00）：婉拒「法圖？我是外校的，進不去吧。」「……慢讀好不好？那裡不用證件。」→ 同一時間慢讀有開＝改約慢讀',r.res==='resched'&&J(r.lines)===J(['「法圖？我是外校的，進不去吧。」','「……慢讀好不好？那裡不用證件。」'])&&r.alt&&r.alt.place==='slowread'&&r.alt.day===sat&&r.alt.h===10,J(r));
    const tue=mon+1, rt=await once('kexin','lawlib',tue,15.5);
    check('2-1. 週二（慢讀休）：照系統改天（慢讀的下一個空檔，不是週二）',rt.res==='resched'&&rt.alt&&rt.alt.place==='slowread'&&rt.alt.day!==tue&&wdOf(rt.alt.day)!==2,J(rt));
    const a=await ask('kexin',['念書','法圖','明天 12:10','好，就']); const iv=(G.invites||[]).slice(-1)[0]||{};
    check('2-1. 手機約可昕去法圖 → 選「好，就 …（慢讀咖啡）」＝約到慢讀',iv.who==='kexin'&&iv.place==='slowread'&&iv.state==='accepted'&&a.opts.some(o=>o.some(t=>/（慢讀咖啡）$/.test(t))),J([iv,a.opts.slice(-1)])); }
  // ===== 芷若、子晴認識階段約法圖 → 婉拒 =====
  { const sat=TD('Y1S2',5,6); fresh(sat-1,9); know('heroine_02',S2); know('heroine_04',S2);
    const z=await once('heroine_02','lawlib',sat,10), q=await once('heroine_04','lawlib',sat,10);
    check('2-1. 芷若認識階段約法圖：婉拒「法圖比總圖還安靜吧？……我會死掉。換 Café 好不好？」',SOCIAL.friendLevel('heroine_02')==='ACQUAINTANCE'&&z.res==='decline'&&J(z.lines)===J(['「法圖比總圖還安靜吧？……我會死掉。換 Café 好不好？」']),J([SOCIAL.friendLevel('heroine_02'),z]));
    check('2-1. 子晴認識階段約法圖：婉拒「法圖？比總圖還不能講話吧。……不要。」',q.res==='decline'&&J(q.lines)===J(['「法圖？比總圖還不能講話吧。……不要。」']),J(q)); }
  // ===== 沛珊大三起（在臺北）、子晴大四平日 =====
  { const r=INVITE_DATA.people.classmate_peishan.rule, src=String(r);
    check('2-1. 沛珊大三起：法圖改約慢讀「法圖我現在進不去了。……慢讀好不好？」；映月湖 acc R 換「好。……我好久沒回去了。」（她在臺北的時候）',/c\.pid==='lawlib'\) return INVITE_DATA\.toSlow\(G,'classmate_peishan',c,I,\['「法圖我現在進不去了。……慢讀好不好？」'\]\)/.test(src)&&/c\.pid==='lake'&&r\.res==='accept'&&!c\.first\) return \{lines:\['「好。……我好久沒回去了。」'\]\}/.test(src));
    const zq=String(INVITE_DATA.people.heroine_04.rule);
    check('2-1. 子晴大四平日：「平日我在工作室。……週六下午可以。法圖週六開到五點對吧。」改到週六 14:00',/c\.pid==='lawlib'&&wk\) return \{res:'resched',why:'work',act:'work',lines:\['「平日我在工作室。……週六下午可以。法圖週六開到五點對吧。」'\],alt:I\.nextSat\(G,'heroine_04',c\.P,c\.day,14\)\}/.test(zq)); }
  // ===== 學姊：法圖不算上限、筆試前那一句、here；筆試前約映月湖 → 婉拒 =====
  { const w11=TD('Y1S1',11,2); fresh(w11,9,{met_sis:true}); know('heroine_05',S6); INV.accept(G,'heroine_05','cafe',w11,17.5,{by:'player'});
    const r=await once('heroine_05','lawlib',TD('Y1S1',11,4),19);
    check('2-1. 學姊第 11 週已經約過一次 Café，同一週約法圖照樣答應（念書類不算上限）',r.res==='accept'||r.res==='here',J([r.res,r.why,r.lines]));
    const w15=TD('Y1S1',15,2); fresh(w15,9,{met_sis:true}); know('heroine_05',S4); const r2=await once('heroine_05','lawlib',TD('Y1S1',15,6),10);
    check('2-1. 學姊筆試前（第 15 週）約法圖：「好。法圖開到九點四十五，我們念到最後一分鐘。」',r2.res==='accept'&&J(r2.lines)===J(['「好。法圖開到九點四十五，我們念到最後一分鐘。」']),J([r2.res,r2.lines]));
    const w=TD('Y1S1',6,3); fresh(w-1,9,{met_sis:true}); know('heroine_05',S4); const e=INV.entAt(G,'heroine_05',w,19.5); const r3=await once('heroine_05','lawlib',w,19.5);
    check('2-1. 她本來就在法圖的時段（筆試前週三晚上）＝here「我在法圖。三樓。你來。」',!e||e.zone!=='lawlib'?true:(r3.res==='here'&&J(r3.lines)===J(['「我在法圖。三樓。你來。」'])),J([e&&e.zone,r3.res,r3.lines]));
    const w5=TD('Y1S1',5,6); fresh(w5-1,9,{met_sis:true}); know('heroine_05',S6); const r4=await once('heroine_05','lake',w5,17.5);
    check('2-2. 學姊筆試前約映月湖：照溫州街婉拒（「散步的話，等我考完。」）',r4.res==='decline'&&r4.why==='exam'&&(r4.lines||[])[0]==='「散步的話，等我考完。」',J(r4)); }
  // ===== 有伴侶約映月湖 → 系統說明 =====
  { const sat=TD('Y1S2',5,6); fresh(sat-1,9,{dating_kexin:true}); know('heroine_01',S6); know('kexin',S6); SOCIAL.remember('heroine_01','KNOWS_KEXIN','');
    G.flags.dating_heroine_02=false; const P0=Object.assign({},CHARACTERS.heroine_03.partner); CHARACTERS.heroine_03.partner={from:'Y1S1',until:'Y4S2'}; know('heroine_03',S6);
    const w2=INV.placeWhy(G,'heroine_03',LK), wz=INV.placeWhy(G,'heroine_03',INV.place('wenzhou')), dc=INV.decide(G,'heroine_03','lake',sat,17.5), tx=INV.reply(G,'heroine_03','lake',dc); CHARACTERS.heroine_03.partner=P0.from?P0:undefined; if(!P0.from) delete CHARACTERS.heroine_03.partner;
    check('2-2. 有伴侶約映月湖：兩個人單獨的規則照溫州街，系統說明（why.partnerWalk「兩個人單獨去散步不太好。約在 Café 或總圖吧。」）',w2===INVITE_DATA.why.partnerWalk&&w2===wz&&dc.res==='decline'&&dc.why==='partner'&&tx===INVITE_DATA.why.partnerWalk,J([w2,dc,tx])); }
  // ===== 分類 =====
  { const mon=TD('Y1S2',4,1); fresh(mon,10); know('heroine_01',S6);
    const a=await ask('heroine_01',['念書','返回','散步','返回','算了']);
    check('2. 分類：法圖在「念書」（總圖、慢讀、法圖）；映月湖在「散步」（溫州街、映月湖）',J(a.opts[1])===J(['去總圖一起念書','去慢讀咖啡念書','去法圖一起念書','返回'])&&J(a.opts[3])===J(['去溫州街散步','去映月湖走走','返回']),J([a.opts[1],a.opts[3]])); }
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });
