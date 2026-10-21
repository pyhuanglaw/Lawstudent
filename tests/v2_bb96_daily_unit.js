// 交接包 v2（BB_96 第 5 節）：大一下的手機小事——不需要瀏覽器。修改前沒有這些條目（第 1 項失敗）。
// 檢查：八則只在大一下（大一上不出現）、條件成立才有、每則一次、一天最多一則（沿用每天的手機小事）；台詞照原文（芷若、子晴的兩種版本）；子晴成發倒數在成發前十四天
// 用法：node tests/v2_bb96_daily_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
(async()=>{
  const IDS=['zr_cocoa_y1s2','zr_art_y1s2','zq_cat03_y1s2','kai_pothos_y1s2','mx_tutor_y1s2','ps_teacher_y1s2','fy_water_y1s2'];
  const D=STORY.DAILY_PHONE||[]; check('大一下的七則都在（學姊的 sis_case_y1s2 刪了：AA_218 17-12）',IDS.every(id=>D.some(d=>d.id===id)),JSON.stringify(IDS.filter(id=>!D.some(d=>d.id===id))));
  if(!IDS.every(id=>D.some(d=>d.id===id))){ console.log('FAILED '+fails); process.exit(1); }
  const all=(o)=>{ o=o||{}; const d0=o.d0||termDay('Y1S2',4,1); fresh(d0,8,'campus',Object.assign({POTHOS:true,JOB_TUTOR:true,FIRST_BUG:true},o.flags||{})); PHONE.join(G,'family_law','法律系直屬家族');
    for(const id of ['heroine_02','heroine_04','classmate_mingxuan','classmate_peishan','npc_fangyt','kai']) (G.contacts=G.contacts||{})[id]=1;
    SOCIAL.remember('heroine_05','FAMILY_THREE_THINGS','x'); SOCIAL.remember('heroine_02','ASKED_HER_DRINK','x'); SOCIAL.remember('heroine_04','PLAYTESTED','x'); SOCIAL.remember('classmate_peishan','SAW_HER_TEACH','x');
    for(let k=0;k<(o.days||30);k++){ G.day=d0+k; G.weekday=wdOf(G.day); run(7,23.9,0.1); } return G; };
  { all(); const N=G.flags.dpN||{};
    check('大一下第 4 週起：八則都出現、每則一次',IDS.every(id=>N[id]===1),JSON.stringify(IDS.map(id=>id+':'+(N[id]|0))));
    const days={}; for(const id of IDS){ const k=G.flags.dpDayOf&&G.flags.dpDayOf[id]; days[k]=(days[k]||0)+1; } check('一天最多一則',Object.values(days).every(n=>n===1),JSON.stringify(days));
    const T=th=>(G.msgs||[]).filter(m=>m.th===th).map(m=>m.text);
    check('學姊不在家族群組自己起頭（AA_218 17-12）：舊存檔有 FAMILY_THREE_THINGS 也不會收到「今天讀到一個判決……」',!T('g:family_law').some(t=>/今天讀到一個判決/.test(t)));
    check('芷若（單身）：「今天有客人點熱可可加濃縮欸」「我還以為只有我會這樣喝」（AA_209）；拉花照片沒有字',T('p:heroine_02').includes('今天有客人點熱可可加濃縮欸')&&T('p:heroine_02').includes('我還以為只有我會這樣喝')&&T('p:heroine_02').includes('📷（拉花）')&&!T('p:heroine_02').includes('今天的拉花。老闆說及格。'),JSON.stringify(T('p:heroine_02')));
    check('子晴（PLAYTESTED、FIRST_BUG）：「📎 cat_v0.3」→ 三分鐘後「插座修好了」',JSON.stringify(T('p:heroine_04').slice(-2))==='["📎 cat_v0.3","插座修好了"]',JSON.stringify(T('p:heroine_04')));
    check('阿凱：「你的黃金葛長新葉了」「我幫你澆了」「不用謝」「我只是順手」',JSON.stringify(T('p:kai').filter(t=>/黃金葛|澆|不用謝|順手/.test(t)))==='["你的黃金葛長新葉了","我幫你澆了","不用謝","我只是順手"]',JSON.stringify(T('p:kai')));
    check('明軒（家教）：兩則（AA_209 附錄B §2、2-1 第 2 列）',JSON.stringify(T('p:classmate_mingxuan').slice(-2))==='["今天家教的學生段考考完了 終於可以喘一下 哈哈","你們考試也快了吧 加油"]'/* AA_373 #13 */,JSON.stringify(T('p:classmate_mingxuan')));
    check('沛珊（SAW_HER_TEACH）：白板照片＋「他們叫我老師。好奇怪。」',JSON.stringify(T('p:classmate_peishan').slice(-2))==='["📷（課輔班白板上歪歪的「謝謝沛珊老師」）","他們叫我老師。好奇怪。"]',JSON.stringify(T('p:classmate_peishan')));
    check('方奕廷：「黃金葛可以剪一段下來水耕」「週末我拿瓶子過去 隔壁而已」（AA_209）',JSON.stringify(T('p:npc_fangyt').slice(-2))==='["黃金葛可以剪一段下來水耕","週末我拿瓶子過去 隔壁而已"]',JSON.stringify(T('p:npc_fangyt'))); }
  { all({flags:{dating_kexin:true,FIRST_BUG:false}}); const T=th=>(G.msgs||[]).filter(m=>m.th===th);
    const zr=T('p:heroine_02'); const coco=zr.find(m=>/熱可可/.test(m.text)), art=zr.filter(m=>/拉花/.test(m.text));
    check('交往中：芷若改在 15:10、友情版「今天有人點熱可可加濃縮。我以為只有我會喝這個。」；拉花多一句「今天的拉花。老闆說及格。」',coco&&coco.text==='今天有人點熱可可加濃縮。我以為只有我會喝這個。'&&Math.abs(coco.h-(15+10/60))<0.11&&art.map(m=>m.text).join('|')==='📷（拉花）|今天的拉花。老闆說及格。',JSON.stringify(zr.map(m=>m.h+' '+m.text)));
    check('沒有 FIRST_BUG：「這版比較不會當機」',T('p:heroine_04').map(m=>m.text).slice(-1)[0]==='這版比較不會當機'); }
  { all({d0:termDay('Y1S1',4,1),days:20}); const N=G.flags.dpN||{}; check('大一上：這八則都不出現',IDS.every(id=>!N[id]),JSON.stringify(IDS.filter(id=>N[id]))); }
  { const dShow=termDay('Y1S2',14,3); fresh(dShow-15,20,'dorm'); PHONE.join(G,'guitar','吉他社'); run(20,23.9); G.day=dShow-14; run(0,22);
    check('子晴成發倒數：成發前十四天 21:00 吉他社群組「成發」「倒數」「十四天」「不能請假」「都要來」（AA_230、AA_313 6-4）',JSON.stringify(txt('g:guitar').filter(t=>/成發|倒數|十四天|請假|都要來/.test(t)).slice(0,5))==='["heroine_04:成發","heroine_04:倒數","heroine_04:十四天","heroine_04:不能請假","heroine_04:都要來"]',JSON.stringify(txt('g:guitar'))); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });
