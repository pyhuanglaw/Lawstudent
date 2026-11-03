// AA_601 以安「一起去行政法院旁聽」（CG-29 的場；企劃線 ebab78c45，AA 定稿第②級；AA601-AN-ADMIN-1102）——不需要瀏覽器。載入方式照 tests/r2y3a_events_unit.js。
//   0  稿、白名單；事件登記；事件的每一句都在稿裡
//   1  ev_an_admin_court 選「下次我也想去。」才記 AN_ADMIN_NEXT
//   2  10/27（三）21:00 她私訊三則＋回覆按鈕（FRIEND 以上、不是前任、有 AN_ADMIN_NEXT 才傳）
//   3  「那天我有課。」→「好。」結束；「好。」＝出遊 11/3（三）13:50「行政法院・旁聽席」（不是 must；那天下午沒有必修）
//   4  ev_an_admin_court_together：法庭裡全是旁白、CG-29、三個選項、AN_ADMIN_TOGETHER there、記憶、熟悉 +2 信任 +1
//   5  沒去＝missed、她不再提
// 修改前（e9f2e315a 的 src：沒有這一場、沒有 AN_ADMIN_NEXT）：FAIL 9（第 4 節起丟例外：沒有事件）、PASS 5；修改後 ALL PASS（20 項）。用法：node tests/aa601_admin_court_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|PORTRAIT_ONLY|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|HOMETOWN_LINES|NEEDED_MSGS|TERMEND|TERMEND_LINES|SYLLABUS|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|Y2B|Y2B_EVENTS|Y2R2|GROUP|GROUP_EVENTS|Y34B|R2Y3A|R2Y3A_EVENTS|MENTOR_WHY_TEXT|HV)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
global.CG_REGISTRY={};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/hometown_lines.js','src/data/needed_msgs.js','src/data/termend_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/data/syllabus.js','src/classes3d.js','src/termend3d.js',
  'src/data/y2b_events.js','src/y2b3d.js','src/data/group_events.js','src/group3d.js','src/y2r2_3d.js','src/data/r2y3a_events.js','src/r2y3a3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
if(typeof XCROM!=='undefined') XCROM.OLD=true; else globalThis.XCROM={OLD:true};   /* 芯慈舊的「第二名」那幾場遊戲預設關著（D116，src/xcrom3d.js S.OLD；預設值在 tests/xinci_romance_unit.js 第 00 項測）：這支測留著的程式本身 */
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
if(typeof R2Y3A==='undefined'||typeof R2Y3A_EVENTS==='undefined'){ check('0. src/data/r2y3a_events.js、src/r2y3a3d.js 載入（R2Y3A_EVENTS、R2Y3A）',false); console.log('FAILED '+fails); process.exit(1); }
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},hide(){},cg(){ return true; },setBg(b){ this.bg=b; }}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null, cards=[], caps=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:(a,b)=>{ caps.push(b); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},syncWeekday(){ G.weekday=wdOf(G.day); },
  titleCard:async(a,b)=>{ cards.push([a,b]); },enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; while(G.hour>=24){ G.hour-=24; G.day++; } G.weekday=wdOf(G.day); },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  money(n){ G.money+=n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const D=k=>STORY.dayOfKey(k);
const fresh=(key,hour,zone,flags)=>{ const day=D(key); G={v:3,day,hour,zone:zone||'dorm',stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{},msgs:[]};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; cards=[]; caps=[]; GM.npc={}; E.interactables=[]; E.npcs.length=0; E.player.lv=0; E.player.obj.position.x=0; E.player.obj.position.z=0; ADV.active=false; return G; };
const LV={ACQ:[10,0,0],FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv]; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
const date=id=>{ G.flags['dating_'+id]=true; const r=ROM.get(G,id); if(r) r.status='dating'; meet(id); };
const join=g=>PHONE.join(G,g,g);
const has=t=>said.some(s=>s.t===t), idx=t=>said.findIndex(s=>s.t===t), any=re=>said.some(s=>re.test(s.t)), all=()=>said.map(s=>s.t);
const TH=th=>(G.msgs||[]).filter(m=>m.th===th), txt=th=>TH(th).map(m=>(m.from||'')+':'+m.text);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const to=(key,h)=>{ G.day=D(key); G.hour=h; G.weekday=wdOf(G.day); };
const tick=()=>{ R2Y3A.phone(G,GM); for(const q of OUT.expire(G)) OUT.onMissed(GM,q); R2Y3A.phone(G,GM); PHONE.tick(G); };
const run=(key,h0,h1,st)=>{ st=st||0.25; for(let h=h0;h<=h1+1e-9;h+=st){ to(key,+h.toFixed(3)); tick(); } };
const ans=(id,k)=>{ const r=PHONE.answer(G,id,k); R2Y3A.phone(G,GM); PHONE.tick(G); return r; };
const go=async(id,h)=>{ const q=OUT.get(G,id); if(!q) return null; G.day=q.day; G.weekday=wdOf(q.day); G.hour=h!=null?h:q.h; said=[]; opts=[]; await OUT.go(GM,q); return q; };
const play=async(id,pk)=>{ said=[]; opts=[]; picks=pk||[]; await EVENTS.run(ev(id)); };
const miss=id=>{ const q=OUT.get(G,id); G.day=q.day; G.weekday=wdOf(q.day); G.hour=q.h+(q.late!=null?q.late:0.75)+0.05; for(const x of OUT.expire(G)) OUT.onMissed(GM,x); PHONE.tick(G); return q; };
const npc=(id,x,z,lv)=>{ const n={id,charId:id,obj:{position:{x,y:0,z},rotation:{y:0}},lv:lv|0}; GM.npc[id]=n; E.npcs.push(n); return n; };
const me=(x,z,lv)=>{ E.player.obj.position.x=x; E.player.obj.position.z=z; E.player.lv=lv|0; };
const K=t=>'kexin:'+t;
const noSuppose=()=>!any(/假設/);
const W1S=STORY.week1Start, noZhe=()=>{ STORY.week1Start=()=>true; }, zheBack=()=>{ STORY.week1Start=W1S; };   /* 不認識阿哲（A15：9/1 開學的局要初遇）*/
const SPEC='docs/story_planning/AA_601_以安_一起去行政法院旁聽_CG29.md', SHA='ebab78c45';
const DOC=(()=>{ try{ return require('child_process').execSync('git show '+SHA+':"'+SPEC+'"',{cwd:path.join(__dirname,'..'),encoding:'utf8'}); }catch(e){ return ''; } })();
const inDoc=t=>DOC.includes(t);
(async()=>{
  check('0. 讀得到稿（AA_601 @'+SHA+'）；白名單有這一份（approved、AA601-AN-ADMIN-1102）',DOC.length>800&&(()=>{ const A=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>e.path===SPEC); return A.length===1&&A[0].sha===SHA&&A[0].status==='approved'&&A[0].task==='AA601-AN-ADMIN-1102'; })());
  const T=ev('ev_an_admin_court_together');
  check('0. 事件 ev_an_admin_court_together 在 STORY_EVENTS（出遊、一次、深色底、約 2 小時）',!!T&&T.trigger==='outing'&&T.once===true&&T.background==='dark'&&T.hours===2&&STORY_EVENTS.filter(e=>e.id==='ev_an_admin_court_together').length===1);
  { const lines=[]; for(const l of (T&&T.dialogue)||[]){ if(l.text!==undefined) lines.push(l.text); for(const c of (l.choice||[])) lines.push(c.text.replace(/^「(.*)」$/,'$1')); }
    const bad=lines.filter(t=>!inDoc(t)); check('0. 事件的每一句台詞、旁白、選項都在稿裡（逐字）',lines.length>=12&&!bad.length,JSON.stringify(bad)); }
  // ===== 1. 觸發：a3 記 AN_ADMIN_NEXT =====
  fresh('2027-10-21',17.75,'noodle'); R('heroine_01','FAM'); await play('ev_an_admin_court',[2]);
  check('1. ev_an_admin_court 選「下次我也想去。」→「好。開庭表我傳給你。……要早到，旁聽席很小。」、記 AN_ADMIN_NEXT',has('好。開庭表我傳給你。……要早到，旁聽席很小。')&&G.flags.AN_ADMIN_NEXT===true);
  fresh('2027-10-21',17.75,'noodle'); R('heroine_01','FAM'); await play('ev_an_admin_court',[0]);
  check('1. 選別的（「一個人對兩台筆電？」）＝不記 AN_ADMIN_NEXT',!G.flags.AN_ADMIN_NEXT);
  // ===== 2. 10/27 21:00 私訊 =====
  const setup=(lv,fl)=>{ fresh('2027-10-27',20.5,'dorm',Object.assign({AN_ADMIN_NEXT:true},fl||{})); R('heroine_01',lv||'FRI'); G.contacts=G.contacts||{}; G.contacts.heroine_01=G.day-100; };
  setup('FRI'); run('2027-10-27',20.75,21.25);
  const M=TH('p:heroine_01'), ask=M.find(m=>m.ask&&m.ask.id==='y3_an_admin');
  check('2. 10/27（三）21:00 她私訊三則（FRIEND 以上）：「下禮拜三下午兩點半，行政法院。」→ 開庭表照片 →「旁聽席很小。我一點五十到。」；回覆「好。」／「那天我有課。」',
    JSON.stringify(txt('p:heroine_01'))===JSON.stringify(['heroine_01:下禮拜三下午兩點半，行政法院。','heroine_01:📷（一張開庭表，第二行用螢光筆畫了一條線。）','heroine_01:旁聽席很小。我一點五十到。'])&&!!ask&&JSON.stringify(ask.ask.opts.map(o=>o.t))===JSON.stringify(['好。','那天我有課。'])&&M.every(m=>m.h>=21&&m.h<21.3),JSON.stringify(txt('p:heroine_01')));
  check('2. 私訊的字都在稿裡',['下禮拜三下午兩點半，行政法院。','📷（一張開庭表，第二行用螢光筆畫了一條線。）','旁聽席很小。我一點五十到。','「好。」／「那天我有課。」'].every(inDoc));
  setup('FAM'); run('2027-10-27',20.75,21.25); check('2. 不到 FRIEND：不傳',!PHONE.sent(G,'y3_an_admin'));
  setup('FRI',{EX_heroine_01:true}); run('2027-10-27',20.75,21.25); check('2. 前任：不傳（AA_600：分手後她不主動）',!PHONE.sent(G,'y3_an_admin'));
  fresh('2027-10-27',20.5,'dorm'); R('heroine_01','FRI'); run('2027-10-27',20.75,21.25); check('2. 沒選「下次我也想去。」：不傳',!PHONE.sent(G,'y3_an_admin'));
  // ===== 3. 回覆 =====
  setup('FRI'); run('2027-10-27',20.75,21.25); ans('y3_an_admin',1);
  check('3. 「那天我有課。」→ 她「好。」結束；AN_ADMIN_TOGETHER no、沒有出遊',txt('p:heroine_01').slice(-1)[0]==='heroine_01:好。'&&G.flags.AN_ADMIN_TOGETHER==='no'&&!OUT.get(G,'y3_an_admin'),JSON.stringify(txt('p:heroine_01')));
  setup('FRI'); run('2027-10-27',20.75,21.25); ans('y3_an_admin',0); run('2027-10-27',21.25,21.5); const q=OUT.get(G,'y3_an_admin');
  check('3. 「好。」＝出遊 11/3（三）13:50「行政法院・旁聽席」、不是 must、事件 ev_an_admin_court_together',!!q&&q.day===D('2027-11-03')&&Math.abs(q.h-(13+50/60))<1e-6&&q.place==='行政法院・旁聽席'&&!q.must&&q.ev==='ev_an_admin_court_together',JSON.stringify(q));
  check('3. 11/3 是週三、下午沒有必修（不用挪日子）',wdOf(D('2027-11-03'))===3&&!COURSES.list.filter(c=>c.term==='Y3S1'&&c.kind==='required').some(c=>(c.slots||[]).some(s=>s.wd===3&&s.block!=='am')));
  // ===== 4. 那一場 =====
  for(const [k,want] of [[0,['嗯。這次我自己看到了。']],[1,['寫不下來。……我想先記住。']],[2,['（走到捷運站，她才開口。）','謝謝你來。']]]){
    setup('FRI',{AN_ADMIN_GO:true}); const cgs=[]; const cg0=ADV.cg; ADV.cg=id=>{ cgs.push(id); return true; }; CG_REGISTRY.cg_admin_court_heroine01={file:'x',title:'t'}; const r0=JSON.stringify(SOCIAL.rel('heroine_01'));
    await play('ev_an_admin_court_together',[k]); ADV.cg=cg0; delete CG_REGISTRY.cg_admin_court_heroine01; const r1=SOCIAL.rel('heroine_01'), rr=JSON.parse(r0);
    const head=['（行政法院的旁聽席只有三排。你們坐在最後一排。）','（左邊是一個人和他的律師，右邊是機關的兩個代理人。法官進來，大家站起來，再坐下。）','（一個小時。以安的筆一直停在筆記本上，一個字都沒寫。）','（退庭以後，你們走出法院。外面的太陽很大。）','……他講完了。'];
    check('4. 選 '+(k+1)+'：法庭裡全是旁白（沒有對白）、CG-29 在第二句旁白之後、出來以後「……他講完了。」→ 三選一 → '+want.join('／')+'；AN_ADMIN_TOGETHER there、記憶、熟悉 +2、信任 +1',
      JSON.stringify(all())===JSON.stringify(head.concat(want))&&said.slice(0,4).every(s=>s.who==null)&&JSON.stringify(cgs)===JSON.stringify(['cg_admin_court_heroine01'])&&G.flags.AN_ADMIN_TOGETHER==='there'&&SOCIAL.has('heroine_01','AN_ADMIN_TOGETHER')&&r1.fam===rr.fam+2&&r1.trust===rr.trust+1,JSON.stringify({s:all(),cgs,r0,r1})); }
  check('4. 選項三個＝稿（「法官一直讓他講完。」「妳怎麼一個字都沒寫？」（不說話，陪她走到捷運站））',JSON.stringify(opts[0])===JSON.stringify(['「法官一直讓他講完。」','「妳怎麼一個字都沒寫？」','（不說話，陪她走到捷運站）']));
  check('4. 人物面板的記憶名稱「一起去行政法院旁聽」',(SOCIAL.MEMORY_LABEL||{}).AN_ADMIN_TOGETHER==='一起去行政法院旁聽');
  check('4. 不提她媽媽、不用手帳',!JSON.stringify(T.dialogue).match(/媽|手帳/));
  // ===== 5. 沒去 =====
  setup('FRI'); run('2027-10-27',20.75,21.25); ans('y3_an_admin',0); run('2027-10-27',21.25,21.5); const n0=(G.msgs||[]).length; miss('y3_an_admin'); run('2027-11-03',15,23);
  check('5. 沒去：AN_ADMIN_TOGETHER missed、她不再提（沒有新的私訊）',G.flags.AN_ADMIN_TOGETHER==='missed'&&TH('p:heroine_01').filter(m=>m.from==='heroine_01').length===3,JSON.stringify(txt('p:heroine_01')));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
