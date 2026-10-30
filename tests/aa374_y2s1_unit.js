// AA_374（企劃線 6fc64130；AA 2026-10-21 定稿）法律系大二上：重演、人在哪、作廢設定——不需要瀏覽器。任務 AA374-Y2S1-FIX-1021。
//   1 宿舍房間裡的人照年級（大二 312 阿哲、柏翰，阿凱不在；大三起柏翰）　2 已在 AA_372 第 3 項（對照）　3 Alison 博覽會那則第 1 週　4 阿哲記分第 14 週
//   5 以安公文第 13～14 週、選了「理由」不發　6 博覽會法服攤位換柏翰（學姊拿掉、熟悉 +1 給柏翰）　7 系籃攤位阿哲的「哥」看 ZHE_CALLS_GE
//   8 子晴「實驗室那封信 我回了」聊過 Q3-L3 或第 12 週以後　9 語彤兩件只在大一下、互斥　10 芯慈慈 3 沒借過筆記的那一句
//   11 和沛珊交往中沒有柏翰那一段（partner、期中晚餐、沒去的照片、分手、群組、階梯兩層）　12 明軒托福那則（沒有 SAW_HIM_STUDY）
//   13 許教授「颱風那天…坐前面」期中考後第一堂　14 可昕 K3-L4 週次 [6,6]（tools/ladder/import_ladder.py）　15 聖誕抽到阿哲　16 系籃送水
//   17 沛珊 12/18 起不回、ps_notes 期限到 12/17 23:59　18 兩件分手合併、群組 BB_97 版、短的兩句　19 柏翰週三總圖、週四下午不在 201、子晴第 16 週不社課
//   20 已在 AA_369 第 7 節第 10 題（對照）　21 翹課句照那一週的主題　22 mx_tutor 大二上拿掉　23 語彤「上禮拜第一次去上」　24 阿哲期末最後一頓和期末飯互斥
//   BB 測試（第 5 節）：宿舍 312、博覽會柏翰、交往中沒有分手、Alison 那則 9/16 以前、12/17 晚上回筆記
// 修改前（開發分支 89008abd）：上面每一項都會失敗（標「對照」的照樣通過）。用法：node tests/aa374_y2s1_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:'?noriders'};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|NEEDED_MSGS|MSG|MSG_POOL|MSG2_POOL|HOMETOWN_LINES|HV|DATE|DATE_DATA|DATE_LINES|CONFESS_LINES|TERMEND|TERMEND_LINES|VAC|VAC_DATA|NOODLE_CLOSED|Y1FILL_LINES|DORM_ROOM|SYLLABUS)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0},userData:{},add(){}});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/romance3d.js',
  'src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/noodle_closed3d.js','src/data/y1fill_events.js',
  'src/data/dorm_room_layout.js','src/data/syllabus.js','src/story3d.js','src/classes3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){}}; global.CHAR={setExpr(){},build:()=>mkObj()};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },syncWeekday(){},
  spawnCharacter(id,x,z,o){ const n=Object.assign({id,charId:id,name:(CHARACTERS[id]||{}).name||id,obj:mkObj()},o||{}); GM.npc[id]=n; return n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k), J=x=>JSON.stringify(x), K=d=>CALENDAR.dateOf(d).key, termDay=(t,w,wd)=>STORY.termDay(t,w,wd);
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:9000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; ADV.active=false; E.npcs=[]; return G; };
const LV={ACQ:[10,0,0],FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv||'FAM']; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const TH=th=>(G.msgs||[]).filter(m=>m.th===th), txt=th=>TH(th).map(m=>m.text);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const evText=id=>{ const e=ev(id); return e?(e.dialogue||[]).map(l=>l&&l.text).filter(t=>typeof t==='string'):[]; };
const NM=id=>SOCIAL.displayName?SOCIAL.displayName(id):(CHARACTERS[id]||{}).name;
/* 宿舍房間（STORY.populate）：生出來的人物 id */
const pop=(zone,k,h,flags)=>{ fresh(D(k),h,zone,flags); const ids=[];
  const E2={npcs:[],interactables:[],q:{level:'high'},zone:{seats:[],spots:{}},levels:null,indoor:zone!=='campus',player:{obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},addNPC(n){ this.npcs.push(n); return n; },removeNPC(n){ this.npcs=this.npcs.filter(m=>m!==n); }};
  const GM2={E:E2,G,npc:{},D:{active:false}}; GM2.spawnNPC=(id)=>{ ids.push(id); const n={id,obj:mkObj(),charId:id}; GM2.npc[id]=n; E2.npcs.push(n); return n; }; GM2.spawnCharacter=GM2.spawnNPC; GM2.spawnExtra=()=>{}; GM2.removeNPC=id=>{ delete GM2.npc[id]; };
  EVENTS.bind(GM2); try{ STORY.populate(zone,GM2); }catch(e){ return ['ERR:'+e.message]; } finally{ EVENTS.bind(GM); } return ids; };
const has=(a,...ids)=>ids.every(id=>a.includes(id)), hasNot=(a,...ids)=>ids.every(id=>!a.includes(id));
(async()=>{
  const Y2=D('2026-09-06');
  // ===== 第 1 項：宿舍房間裡的人 =====
  { const a=pop('dorm','2026-10-07',22.75,{ROOM_Y2:Y2}), b=pop('dorm','2026-10-07',19,{ROOM_Y2:Y2}), c=pop('dorm','2025-10-08',22.75,{DORM_FOUR:true});
    check('1. 大二上晚上進 312（10/7 22:45）：阿哲、柏翰在，阿凱不在（BB 測試）',has(a,'zhe','classmate_bohan')&&hasNot(a,'kai'),J(a));
    check('1. 大二上 19:00 進 312：阿凱不在（他 9/6 以後住別棟）；阿哲、柏翰還沒回來（22:00、22:30）',hasNot(b,'kai','zhe','classmate_bohan'),J(b));
    check('1. 對照：大一（203 四人房）22:45 阿凱、阿哲、柏翰都在',has(c,'kai','zhe','classmate_bohan'),J(c));
    const d1=pop('dorm','2026-12-21',22.6,{ROOM_Y2:Y2}), d2=pop('dorm','2026-12-21',23.1,{ROOM_Y2:Y2}), d0=pop('dorm','2026-12-14',22.6,{ROOM_Y2:Y2});
    check('1. 阿哲 12/19 以後比較晚回來（送 Alison 去捷運站）：12/21 22:36 柏翰在、阿哲還沒回來；23:06 兩個都在；12/14（之前）22:36 阿哲在',has(d1,'classmate_bohan')&&hasNot(d1,'zhe')&&has(d2,'zhe','classmate_bohan')&&has(d0,'zhe'),J([d1,d2,d0]));
    const e3=pop('dorm','2027-10-06',22.75,{ROOM_Y2:Y2,ROOM_Y3:D('2027-09-05')}), e4=pop('dorm','2028-10-04',22.75,{ROOM_Y2:Y2,ROOM_Y3:D('2027-09-05'),ROOM_Y4:D('2028-09-03')});
    check('1. 大三 507、大四 409（AA_208 第 8 節）：只有柏翰（阿哲住別間、阿凱別棟）',has(e3,'classmate_bohan')&&hasNot(e3,'zhe','kai')&&has(e4,'classmate_bohan')&&hasNot(e4,'zhe','kai'),J([e3,e4]));
    const v=pop('dorm','2026-08-20',22.75,{DORM_FOUR:true});
    check('1. 對照：大一暑假（7、8 月）宿舍的室友照舊不在房間（只在學期中）',hasNot(v,'zhe','classmate_bohan'),J(v)); }
  // ===== 第 2 項（已在 AA_372 第 3 項）=====
  check('2. 對照（已在 AA_372 第 3 項）：芯慈借筆記、柏翰考古題、明軒系籃是 once、只在大一上',['ev_xinci_notes','ev_bohan_kaogu','ev_mingxuan_ball'].every(id=>ev(id).once===true&&J(ev(id).term)===J(['Y1S1'])));
  // ===== 第 3、4、5、22 項：主線 4「這週的訊息」的週次 =====
  { const pick=(k,ids,flags,done)=>{ fresh(D(k),21.5,'dorm',flags); for(const id of ids) R(id,'FAM'); for(const e of done||[]) G.events.done[e]=1; return STORY.neededPick(G,D(k)).map(e=>e.id); };
    const y1=pick('2026-09-13',['yu']), y2=pick('2026-09-20',['yu']);
    check('3. Alison「社團博覽會你站哪一攤？」照日子發（AA_491 A：社博搬到 9/12（六），第 1 週週四 9/10 21:00）；第 2 週不再挑',!y2.includes('yu_expo')&&J(NEEDED_MSGS.list.find(e=>e.id==='yu_expo').w)===J([1,1])&&J(NEEDED_MSGS.list.find(e=>e.id==='yu_expo').at)===J({day:'2026-09-10',h:21}),J([y1,y2]));
    fresh(D('2026-09-10'),21.05,'dorm',{}); R('yu','FAM'); STORY.neededRules(GM); PHONE.tick(G); const m=TH('p:yu').find(x=>x.text==='社團博覽會你站哪一攤？我要去偷看。');
    check('3. 真的排進手機：9/10（四）21:00 一到就發，在社博 9/12 以前',!!m&&K(m.day)==='2026-09-10'&&m.h>=21&&m.h<21.2,J(m&&[K(m.day),m.h]));
    const z13=pick('2026-12-06',['zhe']), z14=pick('2026-12-13',['zhe']);
    check('4. 阿哲「週六系籃缺一個記分的」第 14 週（12/13 發，週六＝12/19 系籃）；第 13 週（12/6）不發',z14.includes('zhe_score')&&!z13.includes('zhe_score'),J([z13,z14]));
    const TF=['ev_an_tutor_family_1'], a12=pick('2026-11-29',['heroine_01'],{},TF), a13=pick('2026-12-06',['heroine_01'],{},TF), ar=pick('2026-12-06',['heroine_01'],{AN10_PICK:'reason'},TF), af=pick('2026-12-06',['heroine_01'],{AN10_PICK:'fafu'},TF), an0=pick('2026-12-06',['heroine_01']);
    check('5. 以安公文那則：12/1 麵店那場（ev_an_tutor_family_1）沒演過的不發（AA_313 4-3）；第一則只說「公文我拿到了。」',!an0.includes('an_admin')&&J(NEEDED_MSGS.list.find(e=>e.id==='an_admin').msg)===J(['公文我拿到了。','……先看哪一段？我想先自己看懂。']),J(an0));
    check('5. 以安公文那則：第 12 週（11/29，12/1 麵店那場以前）不發；第 13 週（12/6）發',!a12.includes('an_admin')&&a13.includes('an_admin'),J([a12,a13]));
    check('5. 麵店那場選了「妳可以先陪他們看駁回的理由。」（AN10_PICK reason）的玩家不發；選別的照發',!ar.includes('an_admin')&&af.includes('an_admin'),J([ar,af]));
    const t3=pick('2026-09-27',['classmate_mingxuan'],{JOB_TUTOR:true}), t4=pick('2026-10-04',['classmate_mingxuan'],{JOB_TUTOR:true});
    check('22. 明軒「家教那家的媽媽問你下學期還來不來」大二上拿掉（有 JOB_TUTOR 也不發）',!t3.includes('mx_tutor')&&!t4.includes('mx_tutor'),J([t3,t4])); }
  // ===== 第 23 項 =====
  check('23. 語彤 9/20：「法律系的課，我上禮拜第一次去上。」「教室好大。」',J(NEEDED_MSGS.list.find(e=>e.id==='yt_fafu').msg)===J(['法律系的課，我上禮拜第一次去上。','教室好大。']),J(NEEDED_MSGS.list.find(e=>e.id==='yt_fafu').msg));
  // ===== 第 12 項 =====
  { const e=NEEDED_MSGS.list.find(x=>x.id==='mx_toefl'); fresh(termDay('Y2S1',10,7),21.5,'dorm',{}); R('classmate_mingxuan','FAM'); const v0=STORY.neededVar(G,e);
    SOCIAL.remember('classmate_mingxuan','SAW_HIM_STUDY',''); const v1=STORY.neededVar(G,e);
    check('12. 明軒托福那則：沒有 SAW_HIM_STUDY＝「我朋友在準備托福 叫我問你 🤔」「題目是規則應該為了多數人嗎 怎麼開頭」；看過他念書＝原句',J(v0.msg)===J(['我朋友在準備托福 叫我問你 🤔','題目是規則應該為了多數人嗎 怎麼開頭'])&&!v1.msg&&J(e.msg)===J(['托福作文題目：規則應該為了多數人嗎 🤔 你會怎麼開頭']),J([v0.msg,v1.msg])); }
  // ===== 第 6、7 項：社團博覽會 =====
  { const expo=async(club,flags,pk)=>{ fresh(D('2026-09-16'),13,'campus',Object.assign({['CLUB_'+club]:true},flags||{})); R('classmate_bohan','FAM'); R('heroine_05','FAM'); R('zhe','FAM'); const f0=[+SOCIAL.rel('classmate_bohan').fam,+SOCIAL.rel('heroine_05').fam];
      said=[]; picks=pk||[0]; await EVENTS.run(ev('ev_y2_club_expo')); return {L:lines(),S:said.slice(),f:[+SOCIAL.rel('classmate_bohan').fam-f0[0],+SOCIAL.rel('heroine_05').fam-f0[1]]}; };
    const r=await expo('lawclub_study',{},[0,'先聽他']), bh=NM('classmate_bohan');   /* AB65-3（AA_211 附錄 A 祐廷的選項）：「先問事實，再找條文。」→「有人來問問題，我們先聽他把事情講完，再找條文。」 */
    check('6. 法服攤位選「有人來問問題，我們先聽他把事情講完，再找條文。」：旁白「攤位後面，柏翰抬頭看了你一眼。」、柏翰「……順序對了。」（BB 測試：法服攤位是柏翰）',r.L.includes('攤位後面，柏翰抬頭看了你一眼。')&&r.S.some(s=>s.who===bh&&s.t==='……順序對了。'),J(r.L));
    check('6. 沒有學姊（學姊大二起是碩一、不回法服）：沒有「學姊抬起頭」「她低下頭，繼續整理報名表。」，學姊不說話',!r.L.some(t=>/學姊抬起頭|繼續整理報名表/.test(t))&&!r.S.some(s=>s.who===NM('heroine_05')),J(r.L));
    check('6. after()：熟悉 +1 給柏翰、學姊不加',r.f[0]===1&&r.f[1]===0,J(r.f));
    const b0=await expo('dept_basketball',{},[0]), b1=await expo('dept_basketball',{ZHE_CALLS_GE:true},[0]);
    check('7. 系籃攤位：沒有「哥」的玩家＝阿哲「欸，你站這裡。身高夠，看起來很會打。」；有 ZHE_CALLS_GE＝「哥，你站這裡。…」',b0.S.some(s=>s.t==='欸，你站這裡。身高夠，看起來很會打。')&&!b0.S.some(s=>/^哥，/.test(s.t))&&b1.S.some(s=>s.t==='哥，你站這裡。身高夠，看起來很會打。')&&!b1.S.some(s=>/^欸，你站這裡/.test(s.t)),J([b0.L,b1.L])); }
  // ===== 第 8 項：子晴實驗室那封信 =====
  { const Dz=STORY.DAILY_PHONE.find(d=>d.id==='y2_zq_lab'); const ok=(w,mem)=>{ const d=termDay('Y2S1',w,2); fresh(d,20,'dorm',{}); R('heroine_04','FAM'); SOCIAL.remember('heroine_04','LAB_LETTER',''); G.contacts.heroine_04=d-30; if(mem) SOCIAL.remember('heroine_04','ZQ3_FIFTY_ONE',''); return Dz.ok(G,d); };
    check('8. 「實驗室那封信 我回了」：大二上第 5 週、還沒聊過 Q3-L3＝不傳；聊過 Q3-L3（ZQ3_FIFTY_ONE）＝傳；第 12 週以後沒聊過也傳',!ok(5,false)&&ok(5,true)&&ok(12,false)&&!ok(11,false),J([ok(5,false),ok(5,true),ok(12,false),ok(11,false)])); }
  // ===== 第 9 項：語彤兩件只在大一下、互斥 =====
  { const th=(t,w,done)=>{ fresh(termDay(t,w,2),21.5,'library',{yutong_hospital:true}); R('heroine_03','FRI'); if(done) G.events.done[done]=1; return EVENTS.check(ev('ev_yutong_thanks')); };
    const mw=(t,w,done)=>{ fresh(termDay(t,w,2),21,'noodle',{}); R('heroine_03','FRI'); if(done) G.events.done[done]=1; return EVENTS.check(ev('ev_yutong_midterm_week')); };
    check('9. ev_yutong_thanks（「……阿姨跟你講了吧。」）：大一下照常；大二上不演',th('Y1S2',10)&&!th('Y2S1',3),J([th('Y1S2',10),th('Y2S1',3)]));
    check('9. ev_yutong_midterm_week（「大一期中考那週…」）：大一下第 10 週起演；大二上、大二下都不補',mw('Y1S2',10)&&!mw('Y1S2',9)&&!mw('Y2S1',11)&&!mw('Y2S2',3),J([mw('Y1S2',10),mw('Y1S2',9),mw('Y2S1',11),mw('Y2S2',3)]));
    check('9. 互斥：演了一件，另一件不演',!th('Y1S2',10,'ev_yutong_midterm_week')&&!mw('Y1S2',10,'ev_yutong_thanks')); }
  // ===== 第 10 項：芯慈慈 3 =====
  { const xc=async lent=>{ fresh(termDay('Y2S1',12,1)+1,0.5,'cvs',{}); R('classmate_xinci','FAM'); if(lent) SOCIAL.remember('classmate_xinci','LENT_NOTES',''); said=[]; picks=[0]; await EVENTS.run(ev('ev_xinci_second')); return said.map(s=>s.t); };
    const a=await xc(false), b=await xc(true);
    check('10. 慈 3（AA_547 2-1 新稿，取代「第二名」）：借沒借過筆記都同一版（AA_374 第 10 項那兩句跟著拿掉）；沒有「第一名」「第二名」',J(a)===J(b)&&a.includes('我在算財管的作業。……我喜歡數字對起來的那一下。')&&!a.some(t=>/第一名|第二名|我借你的筆記|我在總圖看過你寫筆記/.test(t)),J([a,b])); }
  // ===== 第 11 項：和沛珊交往中，沒有柏翰那一段 =====
  { const P=CHARACTERS.classmate_peishan.partner; fresh(termDay('Y1S2',8,3),12,'campus',{}); const p0=STORY.partnerOn(G,P); G.flags.dating_classmate_peishan=true; const p1=STORY.partnerOn(G,P);
    check('11. 沛珊的 partner（柏翰）：沒交往＝大一下照常；和她交往中＝沒有（unlessFlag）',p0===true&&p1===false,J([p0,p1]));
    const sup=async dating=>{ fresh(termDay('Y1S2',8,3),19,'noodle',Object.assign({DORM_FOUR:true},dating?{dating_classmate_peishan:true}:{})); R('classmate_peishan','FRI'); R('yu','FAM'); said=[]; picks=[0,0]; await EVENTS.run(ev('ev_midterm_supper_y1s2')); return lines(); };
    const s0=await sup(false), s1=await sup(true);
    check('11. 大一下 4/15 期中晚餐：沒交往＝照舊公開（「對，我們在一起了。你們吃你們的。」）；和沛珊交往中＝沒有柏翰那一段（滷蛋、公開、「上禮拜的事。」、比較晚回 203）',
      s0.some(t=>/對，我們在一起了/.test(t))&&s0.includes('柏翰幫沛珊把滷蛋切成兩半。')&&!s1.some(t=>/對，我們在一起了|滷蛋切成兩半|上禮拜的事|比較晚回 203/.test(t)),J([s0,s1]));
    const miss=dating=>{ fresh(termDay('Y1S2',8,3),20,'dorm',dating?{dating_classmate_peishan:true}:{}); R('classmate_peishan','FRI'); PHONE.join(G,'noodle_team','麵店團'); ev('ev_midterm_supper_y1s2').outingMissed(G,GM,{day:G.day}); PHONE.tick(G); G.hour=21; PHONE.tick(G); return PHONE.sent(G,'zhe_supper_mid2_egg'); };
    check('11. 期中晚餐沒去：沒交往＝阿哲的滷蛋照片；交往中＝沒有',miss(false)&&!miss(true));
    const sp=dating=>{ fresh(termDay('Y2S1',6,1),12.3,'linze',dating?{dating_classmate_peishan:true}:{}); R('classmate_peishan','FRI'); return EVENTS.check(ev('ev_peishan_split')); };
    const grp=dating=>{ fresh(termDay('Y2S1',6,5),20,'campus',dating?{dating_classmate_peishan:true}:{}); R('classmate_peishan','FRI'); PHONE.join(G,'noodle_team','麵店團'); run(20,21.2); return txt('g:noodle_team').filter(t=>/分開了/.test(t)); };
    check('11. 大一上期末就和沛珊交往的存檔：大二上第 6 週沒有「我和柏翰分開了」（走廊那一件不演、週五群組不發；BB 測試）',sp(false)&&!sp(true)&&grp(false).length===1&&grp(true).length===0,J([sp(false),sp(true),grp(false),grp(true)]));
    fresh(termDay('Y2S1',7,1),12,'campus',{dating_classmate_peishan:true}); const k1=STORY.LADDER_SKIP['P2-L4']&&STORY.LADDER_SKIP['P2-L4'](G), k2=STORY.LADDER_SKIP['P3-L5']&&STORY.LADDER_SKIP['P3-L5'](G); delete G.flags.dating_classmate_peishan; const k3=STORY.LADDER_SKIP['P3-L5']&&STORY.LADDER_SKIP['P3-L5'](G);
    check('11. 閒聊階梯講柏翰×沛珊的兩層（P2-L4「大家都知道我跟柏翰在一起了」、P3-L5「我們不在一起了」）：交往中的玩家跳過；沒交往照常',k1===true&&k2===true&&!k3,J([k1,k2,k3])); }
  // ===== 第 13 項 =====
  { const tf=k=>{ fresh(D(k),8.5,'linze',{}); SOCIAL.remember('prof_xu','XU_TYPHOON',''); return EVENTS.check(ev('ev_y2_xu_typhoon_front')); };
    check('13. 許教授「颱風那天來討論的同學，今天坐前面。」：期中考那天（11/2）不出；期中考後第一堂（11/9）出；11/16 不出',!tf('2026-11-02')&&tf('2026-11-09')&&!tf('2026-11-16')&&!tf('2026-10-26'),J([tf('2026-10-26'),tf('2026-11-02'),tf('2026-11-09'),tf('2026-11-16')])); }
  // ===== 第 14 項：可昕 K3-L4 =====
  { const st=((LADDER.byTerm.Y2S1||{}).kexin||{steps:[]}).steps.find(s=>s.id==='K3-L4')||{}; const allow=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>/AA_374_/.test(e.path));
    check('14. 可昕 K3-L4「下禮拜互考，我題目出得比較難。」週次 [6,6]（互考 10/23 只有一次）；第 6 週沒聊到就跳過（skipAfterWeek 6，不卡住後面的層）',J(st.week)===J([6,6])&&st.skipAfterWeek===6&&st.lines&&st.lines[0]==='下禮拜互考，我題目出得比較難。',J([st.week,st.skipAfterWeek]));
    check('14. 匯入白名單有 AA_374@6fc64130（approved、AA374-Y2S1-FIX-1021），ladder.js 的來源寫著它',allow.length===1&&allow[0].sha==='6fc64130'&&allow[0].status==='approved'&&allow[0].task==='AA374-Y2S1-FIX-1021'&&/AA_374@6fc64130/.test(LADDER.source),J(allow.map(e=>e.sha))+' '+String(LADDER.source).slice(-40)); }
  // ===== 第 15、16 項 =====
  check('15. 聖誕交換禮物抽到阿哲：「你抽到阿哲的：一個保溫杯。」（不認識 Alison 的也聽得懂）',evText('ev_y2_xmas').includes('你抽到阿哲的：一個保溫杯。')&&!evText('ev_y2_xmas').some(t=>/阿哲、Alison 的/.test(t)));
  { const W=ev('ev_zhe_game_y2').dialogue, i=W.findIndex(l=>l&&l.label==='water'), seg=W.slice(i,W.findIndex((l,k)=>k>i&&l&&l.label==='end')).filter(l=>l&&l.text).map(l=>(l.speaker||'')+':'+l.text);
    check('16. 系籃送水：阿哲「謝啦。」（另一瓶丟給明軒）、明軒「（接住水）謝啦。」；沒有「後勤部長」「謝謝部長」',seg.includes('zhe:謝啦。')&&seg.includes('classmate_mingxuan:（接住水）謝啦。')&&!seg.some(t=>/後勤部長|謝謝部長/.test(t)),J(seg)); }
  // ===== 第 17 項：沛珊 12/17 =====
  { const op=(k,h,dating)=>{ fresh(D(k),h,'dorm',dating?{dating_classmate_peishan:true}:{}); R('classmate_peishan','FRI'); INV.addContact(G,'classmate_peishan'); return MSG.open(G,'classmate_peishan'); };
    const o17=op('2026-12-17',21.5), o18=op('2026-12-18',10), o18d=op('2026-12-18',10,true);
    check('17. 沛珊不回從 12/18 00:00 起算：12/17 21:30 照常（不是 silent）；12/18 起 silent（交往中照例外 keep）',o17.ok&&o17.mode!=='silent'&&o18.ok&&o18.mode==='silent'&&o18d.mode!==undefined,J([o17,o18,o18d]));
    const notes=(dating,ah)=>{ const w1=termDay('Y2S1',15,4); fresh(w1,21.9,'dorm',Object.assign({STUDYGROUP_LEADER:true},dating?{dating_classmate_peishan:true}:{})); G.events.done.ev_peishan_handover=1; R('classmate_peishan','FRI'); run(21.9,22.1);
      const m=PHONE.byAsk(G,'ps_notes'); if(!m) return {m:null}; G.day=w1+Math.floor(ah/24); G.hour=ah%24; const r=PHONE.answer(G,'ps_notes',0); return {m,until:m.ask.until,w1,r:!!r,reply:txt('p:classmate_peishan').includes('……謝謝你接住。')}; };
    const n1=notes(false,23.5), n2=notes(false,24+1), n3=notes(true,24+1);
    check('17. ps_notes（12/17 22:00）回覆期限到 12/17 23:59：當晚回＝她回「……謝謝你接住。」；12/18 以後回不了、她不回；交往中照例外（沒有期限）（BB 測試）',
      !!n1.m&&n1.until===n1.w1*24+24&&n1.r&&n1.reply&&!n2.r&&!n2.reply&&!!n3.m&&n3.until==null&&n3.r&&n3.reply,J([n1,n2,n3].map(x=>[x.until,x.r,x.reply]))); }
  // ===== 第 18 項：兩件分手合併成一件 =====
  { const old=ev('ev_peishan_bohan_split'); fresh(termDay('Y2S1',6,2),12.5,'linze',{}); R('classmate_peishan','FRI'); G.events.done.ev_peishan_decision=1;
    const oc=EVENTS.check(old), nc=EVENTS.check(ev('ev_peishan_split'));
    check('18. 合併：ev_peishan_bohan_split 不再演（看過 P3 也一樣）；ev_peishan_split 照演（第 6 週中午霖澤館）',!oc&&nc===true,J([oc,nc]));
    const sp=async(p3,lv)=>{ fresh(termDay('Y2S1',6,1),12.3,'linze',{}); R('classmate_peishan',lv||'FRI'); if(p3) G.events.done.ev_peishan_decision=1; said=[]; await EVENTS.run(ev('ev_peishan_split')); return {L:said.map(s=>s.t),F:G.flags}; };
    const a=await sp(true), b=await sp(false), c=await sp(true,'ACQ');
    check('18. 對照：看過 P3、有點熟以上照原本兩句「我們上週分開了。我自己說的。」「柏翰說他不懂。……他沒有錯。我們想要的東西不一樣。」',J(a.L)===J(['我們上週分開了。我自己說的。','柏翰說他不懂。……他沒有錯。我們想要的東西不一樣。'])&&a.F.HEARD_PS_SPLIT===true,J(a.L));
    check('18. 沒看過 P3、或還不熟：「跟你說一下，我跟柏翰分開了。」「我們都還好，讀書會照常。」',J(b.L)===J(['跟你說一下，我跟柏翰分開了。','我們都還好，讀書會照常。'])&&J(c.L)===J(b.L),J([b.L,c.L]));
    check('18. 合併的那一件也記原本 ev_peishan_bohan_split 的後果（PEISHAN_BOHAN_SPLIT）',a.F.PEISHAN_BOHAN_SPLIT===true);
    const grp=(done)=>{ fresh(termDay('Y2S1',6,5),20,'campus',{}); R('classmate_peishan','FRI'); if(done) G.events.done[done]=1; PHONE.join(G,'noodle_team','麵店團'); run(20,21.2); return TH('g:noodle_team').map(m=>m.from+':'+m.text); };
    const g0=grp(), g1=grp('ev_peishan_bohan_split'), g2=grp('ev_peishan_split');
    check('18. 沒遇到的玩家：週五 21:00 群組照 BB_97 版「說一件事，說完就好。」「我和柏翰分開了。是我說的。我們都好。」「……大家照常吃飯，不用特別安慰我。」、阿哲「……收到」；沒有「你們吃你們的」',
      J(g0)===J(['classmate_peishan:說一件事，說完就好。','classmate_peishan:我和柏翰分開了。是我說的。我們都好。','classmate_peishan:……大家照常吃飯，不用特別安慰我。','zhe:……收到']),J(g0));
    check('18. 舊存檔演過 ev_peishan_bohan_split（或合併的那一件）：群組不發',!g1.length&&!g2.length,J([g1,g2]));
    fresh(termDay('Y2S1',6,3),20,'campus',{}); R('classmate_bohan','FRI'); R('classmate_peishan','FRI'); G.events.done.ev_peishan_split=1; G.events.last.ev_peishan_split=G.day-1;
    const ck=MSG.conds2(G,'classmate_bohan','ok').map(x=>x.key), cp=MSG.conds2(G,'classmate_peishan','ok').map(x=>x.key);
    check('18. 手機「還好嗎」（和沛珊分開以後）：演的是合併的那一件也開（原本只認 ev_peishan_bohan_split）',ck.includes('split_peishan')&&cp.includes('bohan_split'),J([ck,cp])); }
  // ===== 第 19 項：作息 =====
  { const at=(id,k,h)=>{ fresh(D(k),h,'campus',{}); return STORY.schedEnt(CHARACTERS[id],G); };
    /* AA_542 第 5 節：麵店日每週不固定兩天（可能是週三）——挑大二上第一個不是麵店日的週三 */
    let wk='2026-10-07'; for(let d=D('2026-09-09');d<D('2026-12-31');d+=7){ if(CALENDAR.dateOf(d).wd===3&&!STORY.noodleDay(d)&&CALENDAR.termOf(d)&&!CALENDAR.termOf(d).exam){ wk=CALENDAR.dateOf(d).key; break; } }
    const w=at('classmate_bohan',wk,19.5);
    check('19. 柏翰週三晚上（大二上不是麵店日的週三 '+wk+' 19:30）：總圖讀書，不在萬才館「社團」（法服週三讀書會已作廢）',!!w&&w.zone==='library'&&w.act==='read',J(w&&[w.zone,w.act]));
    const ids=['classmate_bohan','classmate_xinci','heroine_01','yu','classmate_mingxuan','classmate_peishan'];
    const thu=ids.map(id=>{ const e=at(id,'2026-10-08',14); return e?e.zone+'/'+e.act:'-'; }), thu1=ids.map(id=>{ const e=at(id,'2025-10-09',14); return e?e.zone+'/'+e.act:'-'; });
    check('19. 大二上週四下午（10/8 14:00）沒有課：同學不在 201「上課」',thu.every(x=>!/classroom\/class/.test(x)),J(thu));
    check('19. 對照：大一上週四下午（民總）照舊在教室',thu1.every(x=>/class/.test(x)),J(thu1));
    const z15=at('heroine_04',STORY.dayOfKey&&CALENDAR.dateOf(termDay('Y2S1',15,1)).key,19.5), z16=at('heroine_04',CALENDAR.dateOf(termDay('Y2S1',16,1)).key,19.5);
    check('19. 子晴吉他社：第 15 週週一在萬才館；第 16 週（期末考週）不排',!!z15&&z15.zone==='wancai'&&!(z16&&z16.zone==='wancai'&&z16.act==='club'),J([z15&&z15.zone,z16&&[z16.zone,z16.act]])); }
  // ===== 第 20 項（已在 AA_369 第 7 節第 10 題）=====
  { fresh(D('2026-11-13'),20,'campus',{lawclub:true}); PHONE.join(G,'lawclub_study','法服'); run(20,21.2); const T=TH('g:lawclub_study').map(m=>m.from+':'+m.text);
    check('20. 對照（已在 AA_369 第 7 節第 10 題）：法服群組 11/13「明天九點半，攤位集合。」是柏翰',J(T)===J(['classmate_bohan:明天九點半，攤位集合。']),J(T)); }
  // ===== 第 21 項：翹課那一句照那一週的主題 =====
  { const L=id=>SYLLABUS.skip[id]||[];
    const okText=Object.keys(CLS.SKIP_TOPIC||{}).every(c=>Object.values(CLS.SKIP_TOPIC[c]).every(t=>L(c).includes(t)));
    check('21. 主題句（行政處分第 5 週、竊盜第 10 週、給付遲延第 3 週、相鄰關係第 6 週）都還在 syllabus.js 的翹課句裡',!!CLS.SKIP_TOPIC&&okText&&J(Object.keys(CLS.SKIP_TOPIC).sort())===J(['admin_law','crim_spec','oblig_gen2','property']));
    fresh(D('2026-10-05'),13,'campus',{}); R('classmate_xinci','FAM'); const SL=typeof CLS.skipLine==='function'?CLS.skipLine:(G,it,L,m)=>L[Math.floor((m-1)/3)%L.length];   /* 修改前沒有 CLS.skipLine：照舊的順序（第 1、4、7 次）*/
    const sl=(c,w,m)=>SL(G,{c:{id:c},week:w},L(c),m||1);
    const nt='（私訊）'+NM('classmate_xinci')+'：今天的筆記我拍給你。';
    check('21. 那一週有對應的：行政法第 5 週＝「許教授今天講行政處分…」、刑分第 10 週＝竊盜、債總二第 3 週＝給付遲延、物權第 6 週＝相鄰關係',
      /行政處分/.test(sl('admin_law',5))&&/竊盜/.test(sl('crim_spec',10))&&/給付遲延/.test(sl('oblig_gen2',3))&&/相鄰關係/.test(sl('property',6)),J([sl('admin_law',5),sl('crim_spec',10),sl('oblig_gen2',3),sl('property',6)]));
    check('21. 那週沒有對應的：同學私訊「今天的筆記我拍給你。」（行政法第 6 週、第 1 次翹課也一樣；不再發講第 5 週主題的那一句）',sl('admin_law',6)===nt&&sl('crim_spec',3)===nt&&sl('property',10,4)===nt,J([sl('admin_law',6),sl('crim_spec',3)]));
    check('21. 對照：表裡沒有的課照舊第 1、4、7 次照順序（大一民總、大二通識）',SL(G,{c:{id:'civ_general'},week:6},L('civ_general'),1)===L('civ_general')[0]&&SL(G,{c:{id:'civ_general'},week:6},L('civ_general'),4)===L('civ_general')[1]&&SL(G,{c:{id:'ge_y2s1'},week:2},L('ge_y2s1'),1)===L('ge_y2s1')[0]);
    const skipDay=k=>{ fresh(D(k),13,'campus',{}); R('classmate_xinci','FAM'); CLS.skipNotes(GM); return (G.msgs||[]).filter(m=>m.who==null&&/^（(群組|私訊)）/.test(m.text||'')).map(m=>m.text); };
    const s5=skipDay('2026-10-05'), s6=skipDay('2026-10-12');
    check('21. 真的翹課（下課以後手機那一行）：第 5 週週一翹行政法＝行政處分那一句；第 6 週週一＝「今天的筆記我拍給你。」',s5.some(t=>/行政處分/.test(t))&&s6.includes(nt)&&!s6.some(t=>/行政處分/.test(t)),J([s5,s6])); }
  // ===== 第 24 項：阿哲期末最後一頓（17:00）和期末飯（20:30）互斥 =====
  { const te=done=>{ const w=TERMEND.windowOf('Y2S1'); fresh(w.from,20,'dorm',{}); R('zhe','FRI'); if(done) G.events.done.ev_term_last_meal_y2s1=1; TERMEND.rec(G,'Y2S1').plan={back:w.from,heart:[],friend:['zhe'],fallback:null,gf:[],nope:{},kx:false};
      G.hour=20.7; TERMEND.phone(GM); PHONE.tick(G); return PHONE.sent(G,'te_Y2S1_zhe'); };
    check('24. 演了 17:00 阿哲約的「期末最後一頓」（麵店），20:30 他的期末飯邀約不發；沒演的照發',te(false)&&!te(true)); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
