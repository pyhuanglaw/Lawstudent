// LIFE-LINE 第 1 組（AA_224 1-1～1-6 @e6c064a3；機制 BB_188 A9 @d171faef）——不需要瀏覽器。
// 2024-10-17：E30 多兩行旁白 → 15:30 祐廷私訊可昕（十則、不在群組）＋固定出遊 17:40 → 車上（KX_CAR 三選一，都是接受）→ 摩天輪（最高點不說話，AA_295）→ 交往、回宿舍。
// 舊的 3/19 E25、3/20～22 E26、期末 E19（含 1/4「很有禮貌」、19:15 電話）不再發生；E36 讀 KX_CAR；法律系除夕交往中三個值都打電話；kx1 到車上為止；
// 舊存檔：E25／E21／E19 → KX_CAR，過了 10/17 的當作演過；過了 12/13、2/13 的固定事件當作演過。改版前會失敗。用法：node tests/lifeline_g1_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|NEEDED_MSGS|ROM)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js','src/romance3d.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
const D=k=>STORY.dayOfKey(k), Tm=(d,h)=>d*24+h;
(async()=>{
  const DK=k=>STORY.dayOfKey(k), d30=DK('2024-10-17'), EC={stage:'econ'};
  const econ=(day,hour,zone,flags)=>{ fresh(day,hour,zone,flags); G.stage='econ'; G.flags.LIFELINE_V=1; };
  /* ---------- E30 ---------- */
  { econ(d30,14.7,'campus',{}); picks=['等他們下課']; await EVENTS.run(ev('ev_y0_e30')); const L=lines();
    check('1-1 E30（AA_305 第 5 節：休學只告訴可昕）：「手續比你想的快。十五分鐘。」之後「（你沒有跟任何人說。）」接電話；窗外、可昕背對窗戶、等下課那段拿掉',L.indexOf('（你沒有跟任何人說。）')===L.indexOf('手續比你想的快。十五分鐘。')+1&&L.indexOf('（捷運上。你撥給她。響了兩聲。）')===L.indexOf('（你沒有跟任何人說。）')+1&&!L.some(t=>/窗外|背對窗戶|舉了一下筆|下課鐘/.test(t)),L.slice(3,7).join('｜')); }
  /* ---------- 15:30 電話（AA_296：原本的十則私訊改成演出來的電話，接在 E30 最後）＋固定出遊 ---------- */
  { econ(d30,14.7,'campus',{}); picks=['先走']; await EVENTS.run(ev('ev_y0_e30')); const LC=lines().map(t=>t.replace(/^[^（：]{1,6}：/,'')), i0=LC.indexOf('（捷運上。你撥給她。響了兩聲。）');
    check('1-2 15:30 電話：E30 演完直接接；「我今天去辦休學了。」→「……蛤？」→…→「休學又不是不能進校門。」→「（她掛掉了。）」；沒有「我在窗外」；時間到 15:30',i0>0&&LC[i0+1]==='我今天去辦休學了。'&&LC[i0+2]==='……蛤？'&&LC[i0+10]==='休學又不是不能進校門。'&&LC[i0+11]==='（她掛掉了。）'&&!LC.some(t=>/窗外/.test(t)&&/我在/.test(t))&&G.hour>=15.5-1e-6,JSON.stringify(LC.slice(i0)));
    econ(d30,15.2,'campus',{LEAVE_WEEK:6,E30_WAITED:true}); G.events.done.ev_y0_e30=d30; run(15.2,15.6); const M=TH('p:kexin');
    check('1-2 私訊那十則不再傳（AA_296）',!M.some(m=>m.text==='我今天去辦休學了。'||m.text==='？？？'),JSON.stringify(M.map(m=>m.text)));
    const q=OUT.get(G,'y0_e26');
    check('1-2 固定出遊 y0_e26：當天 17:40 社科院門口、must（只有「出發」）、回程「回到宿舍。」',q&&q.day===d30&&Math.abs(q.h-(17+40/60))<1e-6&&q.must===true&&q.ev==='ev_y0_e26'&&q.back==='回到宿舍。',JSON.stringify(q)); }
  /* AA_304 第 1 列：過了 19:00 還沒出發＝不演，照 KX_CAR 預設帶過；已經演過的不重演 */
  { econ(d30,15.2,'campus',{LEAVE_WEEK:6,E30_WAITED:true}); G.events.done.ev_y0_e30=d30; run(15.2,15.6); const q=OUT.get(G,'y0_e26'); let went=0; const og=OUT.go; OUT.go=async()=>{ went++; };
    run(19.0,19.3); OUT.go=og;
    check('AA_304-1 10/17 過了 19:00 還沒出發：車上不演（不出發）、交往照記、KX_CAR 預設 only_me',went===0&&q.state==='done'&&G.flags.dating_kexin===true&&G.flags.Y0_DATING===true&&G.flags.KX_CAR==='only_me'&&!!G.events.done.ev_y0_e26,JSON.stringify({went,st:q.state,car:G.flags.KX_CAR}));
    econ(d30,15.2,'campus',{LEAVE_WEEK:6,E30_WAITED:true}); G.events.done.ev_y0_e30=d30; run(15.2,15.6); const q2=OUT.get(G,'y0_e26'); G.events.done.ev_y0_e26=d30; let went2=0; OUT.go=async()=>{ went2++; };
    run(18.0,18.3); OUT.go=og;
    check('AA_304-1 車上已經演過（events.done）：不重演、出遊記成完成',went2===0&&q2.state==='done',JSON.stringify({went2,st:q2.state})); }
  /* ---------- 車上＋摩天輪 ---------- */
  const car=ev('ev_y0_e26');
  for(const [pick,val] of [['宿營','camp'],['只有我','only_me'],['是現在','take_back']]){ econ(d30,17+40/60,'campus',{}); picks=[pick]; await EVENTS.run(car); const L=lines();
    check('1-3／1-4 車上選「'+pick+'」＝KX_CAR '+val+'、摩天輪最高點祐廷「……在一起吧。」→ 可昕「好。」（AA_303 第 2 節 9，取代 AA_295 的不說話）、交往（dating_kexin、Y0_DATING、KX_DATING_SINCE 2024-10-17、E26_DAY）、送她回去',G.flags.KX_CAR===val&&L.includes('祐廷：我喜歡過妳。')&&(()=>{ const i=L.indexOf('（摩天輪。到最高的時候，台北看起來好小。）'); return i>0&&L[i+1]==='祐廷：……在一起吧。'&&L[i+2]==='杜可昕：好。'; })()&&!L.some(t=>/誰都沒有說話/.test(t))&&!L.some(t=>/假設|從這裡開始/.test(t))&&G.flags.dating_kexin===true&&G.flags.Y0_DATING===true&&G.flags.KX_DATING_SINCE==='2024-10-17'&&G.flags.E26_DAY!=null&&L[L.length-2]==='（你送她回女舍。回到 412，已經快十一點了。）'&&L[L.length-1]==='（阿勳已經睡了。韋綸在上舖滑手機，唐睿還沒回來。沒有人問你去了哪裡。）',L.slice(-8).join('｜')); }
  { econ(d30,17+40/60,'campus',{}); G.events.done.ev_y0_e14=1; picks=['是現在']; await EVENTS.run(car); const L=lines(), i=L.indexOf('杜可昕：我喜歡的是你。');
    econ(d30,17+40/60,'campus',{}); picks=['是現在']; await EVENTS.run(car); const L0=lines();
    check('1-3（AA_303 第 2 節 9）：保齡球演過＝「我喜歡的是你。」後面接「保齡球那天，我挑你的制服。……你都沒發現。」再接「你今天說你休學……」；保齡球沒演過（舊存檔）不說',i>0&&L[i+1]==='杜可昕：保齡球那天，我挑你的制服。……你都沒發現。'&&L[i+2]==='杜可昕：你今天說你休學，我第一個想到的是：完了，他要跑了。'&&!L0.some(t=>t.includes('保齡球那天')),JSON.stringify(L.slice(i,i+3))); }
  { econ(d30,17+40/60,'campus',{}); picks=['是現在']; await EVENTS.run(car); const L=lines().join('｜');
    check('1-3（e6c064a3）：沒有「我要記一輩子」「我想在最高的地方說」；摩天輪的約是「你晚上有事嗎？」「那去坐摩天輪。」',!L.includes('記一輩子')&&!L.includes('最高的地方說')&&L.includes('你晚上有事嗎？')&&L.includes('那去坐摩天輪。')); }
  /* AA_358 2-3（AA-C 2026-10-21 659d9d81）：有去中秋系烤（ev_y0_e08 演過）照原句；沒去的換「妳那陣子一直跟他講話。」「他在問我會計作業。他每次都問。」（修改前 FAIL：沒去也說「中秋系烤那天」）*/
  { econ(d30,17+40/60,'campus',{}); G.events.done.ev_y0_e08=1; picks=['是現在']; await EVENTS.run(car); const L=lines();
    econ(d30,17+40/60,'campus',{}); picks=['是現在']; await EVENTS.run(car); const L0=lines(), i0=L0.indexOf('祐廷：妳那陣子一直跟他講話。');
    check('AA_358 2-3 車上：去過中秋系烤＝「中秋系烤那天，妳一直跟他講話。」「他在問我會計作業。他問了一個晚上。」；沒去＝「妳那陣子一直跟他講話。」「他在問我會計作業。他每次都問。」（接「……你是不是很笨。」）',
      L.includes('祐廷：中秋系烤那天，妳一直跟他講話。')&&L.includes('杜可昕：他在問我會計作業。他問了一個晚上。')&&!L.includes('祐廷：妳那陣子一直跟他講話。')
      &&i0>0&&L0[i0+1]==='杜可昕：他在問我會計作業。他每次都問。'&&L0[i0+2]==='杜可昕：……你是不是很笨。'&&!L0.some(t=>t.includes('中秋系烤那天')),JSON.stringify(L0.slice(Math.max(0,i0-1),i0+3))); }
  /* ---------- 舊的不再發生 ---------- */
  { const d25=DK('2025-03-19'); econ(d25,17,'campus',{Y0_DATING:true,dating_kexin:true}); run(17,21);
    check('E25 拿掉：3/19 17:30 沒有「今天晚上有空嗎？」、沒有醉月湖的出遊；事件 retired',!PHONE.sent(G,'y0_e25_ask')&&!OUT.get(G,'y0_e25')&&!!ev('ev_y0_e25').retired); }
  { const d26=DK('2025-03-22'); econ(d26-2,21.5,'dorm',{Y0_DATING:true,dating_kexin:true}); run(21.5,22.5);
    check('舊 E26 拿掉：3/20 22:00 沒有「週六傍晚有空嗎？」',!PHONE.sent(G,'y0_e26_ask')&&!OUT.get(G,'y0_e26')); }
  { const fe=STORY.y0FinalEnd({day:d30,flags:{},stage:'econ'}); econ(fe?fe.day:DK('2025-01-02'),15,'campus',{KX_CAR:'camp',Y0_DATING:true,dating_kexin:true}); run(15,20);
    check('E19 拿掉：期末考完沒有韋綸的公館聚餐、沒有出遊；事件 retired',!PHONE.sent(G,'y0_e19_ask')&&!OUT.get(G,'y0_e19')&&!!ev('ev_y0_e19').retired); }
  /* ---------- E36、法律系除夕 ---------- */
  const e36=ev('ev_y0_e36');
  { econ(DK('2025-08-13'),20,'campus',{KX_CAR:'only_me',E36_RESULT:true}); picks=[0,0,0,0]; await EVENTS.run(e36); const a=lines().join('｜');
    econ(DK('2025-08-13'),20,'campus',{KX_CAR:'camp',E36_RESULT:true}); picks=[0,0,0,0]; await EVENTS.run(e36); const b=lines().join('｜');
    check('1-6 E36：KX_CAR 不管是什麼，放榜電話都沒有「你那天說，你以為只有你。」「不是只有妳。」（AA_298 第 9 節拿掉）',!a.includes('你以為只有你')&&!a.includes('不是只有妳')&&!b.includes('你以為只有你')); }
  { const ny=STORY.lunarNewYear?null:null; fresh(DK('2026-02-16'),21.5,'dorm',{dating_kexin:true,KX_CAR:'camp'}); const N=STORY.lunarNewYear(); G.day=N-1; G.weekday=wdOf(G.day); run(21.5,22.5); const M=txt('p:kexin').join('｜');
    check('1-6 法律系除夕：交往中、KX_CAR camp 也先接到電話「（電話響了。她那邊的鞭炮聲。）」「新年快樂。」（不是「今年不開玩笑了」）',PHONE.sent(G,'kx_kn_call')&&M.includes('新年快樂。')&&!M.includes('今年不開玩笑了'),M); }
  /* ---------- 舊存檔 ---------- */
  const mig=(day,hour,flags,stage)=>{ const s={day,hour,stage:stage||'econ',flags:Object.assign({},flags),events:{done:{},last:{},count:0},outings:[]}; STORY.lifeLineMigrate(s); return s; };
  { const s0=mig(DK('2024-10-10'),12,{E19_ASK:'joke'});
    check('A9-2 存檔在 10/17 以前：照新流程（不當作演過、不交往）',!s0.flags.dating_kexin&&!s0.events.done.ev_y0_e26&&s0.flags.LIFELINE_V===1);
    const s1=mig(DK('2024-12-01'),12,{E19_ASK:'joke'});
    check('A9-2 存檔 12/1（舊的還沒交往）：E19 joke＝take_back、交往中、10/17 車上當作演過',s1.flags.KX_CAR==='take_back'&&s1.flags.dating_kexin===true&&s1.flags.Y0_DATING===true&&s1.flags.KX_DATING_SINCE==='2024-10-17'&&!!s1.events.done.ev_y0_e26);
    const s2=mig(DK('2025-03-25'),12,{E25_ANSWER:'first_day',E21_ANSWER:'joke',E19_ASK:'none'});
    check('A9-2 E25 優先：first_day＝camp；過了 2/13＝RETAKE_TOGETHER、CRAM_FREE_KNOWN 當作演過',s2.flags.KX_CAR==='camp'&&s2.flags.RETAKE_TOGETHER===true&&s2.flags.CRAM_FREE_KNOWN===true&&!!s2.events.done.ev_y0_e27);
    const s3=mig(DK('2025-01-10'),12,{E21_ANSWER:'serious'}); const s4=mig(DK('2025-01-10'),12,{}); const s5=mig(DK('2025-01-10'),12,{E25_ANSWER:'new_year'});
    check('A9-2 E21 serious＝only_me；什麼都沒有＝only_me；E25 new_year＝take_back；12/13 過了＝CRAM_FREE_KNOWN；2/13 還沒到＝不動',s3.flags.KX_CAR==='only_me'&&s4.flags.KX_CAR==='only_me'&&s5.flags.KX_CAR==='take_back'&&s3.flags.CRAM_FREE_KNOWN===true&&!s3.flags.RETAKE_TOGETHER);
    const s6=mig(DK('2025-09-20'),12,{PLAYED_Y0:true,E25_ANSWER:'only_me',dating_kexin:true},'law'); const s7=mig(DK('2025-09-20'),12,{},'law');
    check('A9-2 法律系存檔：玩過經濟系的照對照表補 KX_CAR；沒玩過的不動',s6.flags.KX_CAR==='only_me'&&!s7.flags.KX_CAR&&!s7.flags.dating_kexin);
    const s8=mig(DK('2024-12-01'),12,{E19_ASK:'joke'}); s8.flags.LIFELINE_V=1; const again=STORY.lifeLineMigrate(s8);
    check('A9-2 只做一次（LIFELINE_V）',again===false); }
  /* ---------- kx1 ---------- */
  check('A-21：kx1（可昕大一上的手機小事）到 10/17 車上為止（KX_CAR 有值就停）',(()=>{ const src=require('fs').readFileSync(require('path').join(ROOT,'src/story3d.js'),'utf8'); return src.includes("const kx1=G=>!!G.flags.E06_DONE&&!G.flags.KX_CAR"); })());
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
