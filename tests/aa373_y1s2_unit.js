// AA_373（企劃線 a48fe1b7；AA 2026-10-21 定稿）法律系大一下：時間、人在哪、作廢設定——不需要瀏覽器。任務 AA373-Y1S2-FIX-1021。
//   第 2 項（沛珊「讀書會週三，萬才館。」）在 AA_369 第 4 節做了，這裡不測。這裡測第 1、3～19、23～26 項＋第 5 節 BB 的五項：
//   1 可昕「我們的日子」每週固定格只排到第 16 週（6/15 起她在高雄）、家教同樣；STORY.termDayIn 超過學期不回傳日子；舊存檔排在學期以後的拿掉
//   3 沛珊的伴侶期間 2026-04-06（第 7 週週一）起：第 1～6 週約吃飯、約會選單不出現「兩個人單獨去吃飯不太好…」「她現在有交往的對象」
//   4 芯慈那段「我們當過室友。」　5 Alison 烏來改 4/18（4/4 她在麵店團的春假旅行：作息、手機朋友頁、偶遇）
//   6 沛珊第 5～15 週週二、四 16～18 在溫州街課輔班（週一、五照舊總圖）、「一週兩天。」（事件、閒聊階梯）　7 語彤大一下期末邀約「禮拜五」（一般、心意）
//   8 學姊 S2-L6「上學期期中的時候…」「那杯黑咖啡，謝謝。」　9 通識第 6 週天文館的圓頂（旁白、宥辰、圓頂裡很暗）
//   10 3/2「這個週末我已經空下來了」、2/14「開學第二個週末」、第一次「我們的日子」在第 2 週的週末　11 春假車上「第三頁寫的，今天不算」、看星星「你們這禮拜上了什麼課？」
//   12 方奕廷大一下「七月我就要上山了」　13 明軒「你們考試也快了吧 加油」　14 以安「片假名我還是會看錯」　15 期中晚餐「一個沒見過的女生」　16 沒去的群組「柏翰幫沛珊切的」「……他們在一起了」
//   17 期末河堤「那場演講。」只給 5/7 回過她「講者最後問…」的玩家　18 芷若大一下期末飯 22:00　19 總圖十點關、22:10　23 阿勳、品妤「在活大吃午餐」　24 大一下「這半年」　25、26 可昕不比輸贏
//   第 6 節（企劃線 bdab2f42，AA 22:0x 答比輸贏清單＋十二題）：6-1 可昕不比（互考「兩個都對。……走，山下那攤。」、6/29「明年再各說一科」、經濟系 r7「上次是我請的」、p2b「好，聽你的」）；
//   6-2 第 3 題天文館（黑板、觀察、開頭旁白）、第 4 題「上學期期中那個空的保溫瓶」、第 7 題語彤「禮拜五。打烊以後」、第 8 題視訊互考「……下次見面，山下那攤。」、第 10 題大二上「這一年多」、
//   第 11 題麵店團春假旅行（人物線索）、第 12 題小福（對照：第一輪 #23 已改）
// 修改前（開發分支 73ce13de）：上面每一項都會失敗（標「對照」的照樣通過）；第 6 節的檢查在 y1b c27e8ad8 上失敗（對照照樣通過）。用法：node tests/aa373_y1s2_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|NEEDED_MSGS|MSG|MSG_POOL|MSG2_POOL|HOMETOWN_LINES|HV|DATE|DATE_DATA|DATE_LINES|CONFESS_LINES|TERMEND|TERMEND_LINES|VAC|VAC_DATA|NOODLE_CLOSED|Y1FILL|Y1FILL_LINES|Y1FILL_EVENTS|HOLFF|SYLLABUS|FREE_TRIPS|TRIP|ENCOUNTERS|ENC)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } length(){ return Math.hypot(this.x,this.y,this.z); } normalize(){ const l=this.length()||1; this.x/=l; this.y/=l; this.z/=l; return this; } }};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/romance3d.js',
  'src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/noodle_closed3d.js',
  'src/data/free_trips.js','src/freetrip3d.js','src/data/encounters.js','src/encounter3d.js','src/data/syllabus.js',
  'src/story3d.js','src/holff3d.js','src/classes3d.js','src/data/y1fill_events.js','src/y1fill3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
if(typeof HOME!=='undefined') HOME.phoneRules=()=>{};   /* 家人群組的週訊息和這裡無關 */
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0,removeNPC(){}};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },syncWeekday(){},removeNPC(){},hasNote:()=>true,
  spawnNPC(id,spec,x,z,o){ const n=Object.assign({id,charId:id,name:spec&&spec.name,obj:{position:{x,y:0,z}},beh:'idle'},o||{}); GM.npc[id]=n; return n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k), J=x=>JSON.stringify(x), K=d=>d==null?null:CALENDAR.dateOf(d).key, termDay=(t,w,wd)=>STORY.termDay(t,w,wd);
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:9000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{},memo:[]};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; ADV.active=false; return G; };
const LV={ACQ:[10,0,0],FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv||'FAM']; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const TH=th=>(G.msgs||[]).filter(m=>m.th===th), txt=th=>TH(th).map(m=>m.text);
const lines=()=>said.map(s=>s.t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const evText=id=>{ const e=ev(id); const out=[]; const walk=L=>{ for(const l of (L||[])){ if(!l) continue; if(typeof l.text==='string') out.push(l.text); if(Array.isArray(l.choice)) for(const c of l.choice) if(typeof c.text==='string') out.push(c.text); } }; if(e) walk(e.dialogue); return out; };
const kxOD=()=>OUT.rec(G).filter(q=>/^kx_od_/.test(q.id));
(async()=>{
  const LAST=D('2026-06-14');
  check('0. 對照：大一下 2026-02-23～06-14（16 週），第 16 週週六＝6/13、第 7 週週一＝4/6、第 8 週週六＝4/18',K(termDay('Y1S2',1,1))==='2026-02-23'&&K(CALENDAR.termDays('Y1S2').to)==='2026-06-14'&&K(termDay('Y1S2',16,6))==='2026-06-13'&&K(termDay('Y1S2',7,1))==='2026-04-06'&&K(termDay('Y1S2',8,6))==='2026-04-18');
  // ===== 第 1 項：「我們的日子」、家教只排到第 16 週 =====
  { const ok=typeof STORY.termDayIn==='function';
    check('1. STORY.termDayIn：大一下第 16 週週六＝6/13；第 17、18 週（已經放假）不回傳日子',ok&&K(STORY.termDayIn('Y1S2',16,6))==='2026-06-13'&&STORY.termDayIn('Y1S2',17,6)===null&&STORY.termDayIn('Y1S2',18,1)===null,ok?J([STORY.termDayIn('Y1S2',17,6),STORY.termDayIn('Y1S2',18,1)]):'沒有 STORY.termDayIn');
    check('1. 對照：STORY.termDay 照舊往後推（第 17 週週六＝6/20；舊存檔只有週次的紀錄還在用）',K(termDay('Y1S2',17,6))==='2026-06-20');
    /* 從第 2 週的第一次（已經去過）一路走到 6/30：每天 9:00、15:00、20:00 跑手機規則，過了的固定格當作去過 */
    const sim=(dayKey,mode)=>{ const wd={fri:5,sat:6,sun:7}[dayKey], hh={fri:19,sat:14,sun:14}[dayKey], d1=termDay('Y1S2',2,wd);
      fresh(d1,hh+3,'dorm',{dating_kexin:true,KX_OUR_DAY:{day:dayKey,mode}}); OUT.plan(G,{id:'kx_our_day1',ev:'ev_kexin_our_day',day:d1,h:hh,place:'公館',title:'我們的日子'}); OUT.get(G,'kx_our_day1').state='done';
      for(let d=d1;d<=D('2026-06-30');d++){ G.day=d; G.weekday=wdOf(d); for(const h of [9,15,20.5]){ G.hour=h; STORY.phoneRules(GM); PHONE.tick(G); for(const q of kxOD()) if(q.state==='planned'&&(q.day<d||(q.day===d&&q.h<=h))) q.state='done'; } }
      return kxOD().map(q=>K(q.day)).sort(); };
    const a=sim('sat','mid'), b=sim('fri','nccu');
    check('1／BB-1. 交往中、選「週六／約在中間」：「我們的日子」排到 6/13（第 16 週）為止，6/15 以後一格都沒有（原本還有 6/20、6/27）',a.length>0&&a[a.length-1]==='2026-06-13'&&a.every(k=>k<='2026-06-14'),J(a.slice(-3)));
    check('1／BB-1. 選「週五晚上／我開車去政大」：最後一格 6/12（第 16 週週五），6/15 以後沒有',b.length>0&&b[b.length-1]==='2026-06-12'&&b.every(k=>k<='2026-06-14'),J(b.slice(-3)));
    check('1. 對照：學期中每週照排（第 3 週週六 3/14、第 5 週週六 3/28 都有；她自己的第 8、9 週不排）',a.includes('2026-03-14')&&a.includes('2026-03-28')&&!a.includes('2026-04-18')&&!a.includes('2026-04-25'),J(a.slice(0,8)));
    /* 舊存檔：第 16 週週六 15:00 已經排好了 6/20 那一格 */
    fresh(D('2026-06-13'),15,'dorm',{dating_kexin:true,KX_OUR_DAY:{day:'sat',mode:'mid'}}); OUT.plan(G,{id:'kx_our_day1',ev:'ev_kexin_our_day',day:termDay('Y1S2',2,6),h:14,place:'公館',title:'我們的日子'}); OUT.get(G,'kx_our_day1').state='done';
    OUT.plan(G,{id:'kx_od_'+D('2026-06-20'),ev:'ev_kexin_our_day_wk',day:D('2026-06-20'),h:14,place:'溫州街',title:'我們的日子：溫州街',odPlace:'wenzhou'}); STORY.phoneRules(GM);
    const old=OUT.get(G,'kx_od_'+D('2026-06-20'));
    check('1. 舊存檔已經排在 6/20 的「我們的日子」：不再是 planned（出發選單不會出現）；也不再排新的',!!old&&old.state!=='planned'&&!kxOD().some(q=>q.state==='planned'&&q.day>LAST),J(kxOD().map(q=>[K(q.day),q.state])));
    /* 家教：週二 */
    const tut=(k,h,extra)=>{ fresh(D(k),h,'dorm',{JOB_TUTOR:true,TUTOR_WD:2,tutorFromDay:termDay('Y1S2',3,1)}); if(extra) extra(); STORY.phoneRules(GM); return OUT.rec(G).filter(q=>/^tutor_/.test(q.id)).map(q=>[K(q.day),q.state]); };
    const t15=tut('2026-06-02',20), t16=tut('2026-06-09',20);
    check('1. 對照：家教第 15 週週二 20:00 排下週二 6/9（第 16 週）',J(t15)===J([['2026-06-09','planned']]),J(t15));
    check('1. 家教第 16 週週二 20:00（那週的家教過了）：不排 6/16（已經放假，暑假家教另外排）',!t16.some(([k])=>k>'2026-06-14'),J(t16));
    const t16b=tut('2026-06-12',12,()=>OUT.plan(G,{id:'tutor_'+D('2026-06-16'),ev:'ev_tutor_lesson',day:D('2026-06-16'),h:19,place:'學生家（公館附近）',title:'家教'}));
    check('1. 舊存檔已經排在 6/16 的家教：不再是 planned',J(t16b)!==J([['2026-06-16','planned']])&&!t16b.some(([k,s])=>k>'2026-06-14'&&s==='planned'),J(t16b)); }
  // ===== 第 3 項：沛珊的伴侶期間從 4/6 起 =====
  { const P=CHARACTERS.classmate_peishan.partner, on=k=>STORY.partnerOn({day:D(k),events:{done:{}},flags:{}},P), it=k=>STORY.inTerms({day:D(k)},P);
    check('3. 沛珊 partner.from＝2026-04-06（大一下第 7 週週一）',P.from==='2026-04-06',J(P));
    check('3. 伴侶期間：大一下 2/23～4/5（第 1～6 週）沒有、4/6 起有；大一上沒有；大二上第 6 週還有、第 7 週沒有',!on('2026-02-23')&&!on('2026-03-18')&&!on('2026-04-05')&&on('2026-04-06')&&on('2026-04-15')&&on('2026-06-10')&&!on('2025-10-01')&&on(K(termDay('Y2S1',6,3)))&&!on(K(termDay('Y2S1',7,1))),J(['2026-04-05','2026-04-06'].map(on)));
    check('3. 手機聊天、旁白用的 STORY.inTerms 也從 4/6 起（3/30 沒有、4/6 有）',!it('2026-03-30')&&it('2026-04-06'),J([it('2026-03-30'),it('2026-04-06')]));
    const PL=id=>INVITE_DATA.places.find(p=>p.id===id), MEAL='兩個人單獨去吃飯不太好。約在 Café 或總圖吧。';
    const ask=wk=>{ fresh(termDay('Y1S2',wk,3),10,'campus',{}); R('classmate_peishan','FRI'); const r=SOCIAL.rel('classmate_peishan'); r.npcRom=35; INV.addContact(G,'classmate_peishan');
      return {meal:INV.placeWhy(G,'classmate_peishan',PL('noodle')),date:DATE.canAsk(G,'classmate_peishan'),will:DATE.willing(G,'classmate_peishan')}; };
    const W=[1,2,3,4,5,6].map(ask), w8=ask(8);
    check('3／BB-2. 第 1～6 週約沛珊吃飯：不出現「兩個人單獨去吃飯不太好。約在 Café 或總圖吧。」',W.every(x=>x.meal!==MEAL),J(W.map(x=>x.meal)));
    check('3／BB-2. 第 1～6 週約會選單：不出現「她現在有交往的對象」',W.every(x=>x.date.why!=='她現在有交往的對象'&&x.will.why!=='partner'),J(W.map(x=>x.date.why||'ok')));
    check('3. 對照：第 8 週（4/15 期中晚餐公開以後）照舊兩個都出現',w8.meal===MEAL&&w8.date.why==='她現在有交往的對象'&&w8.will.why==='partner',J([w8.meal,w8.date,w8.will])); }
  // ===== 第 4 項：芯慈那段 =====
  { const T=evText('ev_sk03_lunch');
    check('4. SK03 芯慈「你們認識？」的選項：「我們當過室友。」（沒有「我們一起住過一年。」）',T.includes('「我們當過室友。」')&&!T.some(t=>/住過一年/.test(t)),J(T.filter(t=>/室友|住過/.test(t)))); }
  // ===== 第 5 項：Alison 烏來 4/18 =====
  { const at=(k,h)=>{ fresh(D(k),h,'gongguan',{}); R('yu','FAM'); return {e:STORY.schedEnt(CHARACTERS.yu,G),w:STORY.whereIs(GM,'yu')}; };
    const a=at('2026-04-04',12), b=at('2026-04-18',12), c=at(K(termDay('Y1S1',6,6)),12), d=at(K(termDay('Y2S1',6,6)),12);
    check('5／BB-3. 4/4（六）12:00 Alison 在麵店團的春假旅行：作息不是「和社團在烏來」，手機朋友頁不寫烏來',!(a.e&&a.e.enc==='D20')&&!(a.w&&/烏來/.test(a.w.away||'')),J([a.e&&(a.e.away||a.e.zone),a.w]));
    check('5. 4/18（六，期中考完那個週六）12:00：「和社團在烏來」',!!b.e&&b.e.enc==='D20'&&!!b.w&&b.w.away==='和社團在烏來',J([b.e&&b.e.away,b.w]));
    check('5. 對照：大一上、大二上第 6 週週六照舊在烏來',!!c.e&&c.e.enc==='D20'&&!!d.e&&d.e.enc==='D20');
    const row=ENCOUNTERS.rows.find(r=>r.who==='yu'&&r.spot==='D20'); const enc=k=>{ fresh(D(k),12,'gongguan',{}); R('yu','FAM'); const why=[]; return {ok:!!ENC.eligible(G,row,why),why}; };
    const e1=enc('2026-04-04'), e2=enc('2026-04-18'), e3=enc(K(termDay('Y1S1',6,6)));
    check('5. 烏來的偶遇（自由出行）：4/4 不排、4/18 照排；大一上第 6 週照舊（對照）',!e1.ok&&e2.ok&&e3.ok,J([e1.why,e2.why,e3.why])); }
  // ===== 第 6 項：沛珊的課輔班 =====
  { const ps=CHARACTERS.classmate_peishan, at=(wk,wd,h)=>{ fresh(termDay('Y1S2',wk,wd),h,'wenzhou',{}); return STORY.schedEnt(ps,G)||{}; };
    const A=[[5,2,16],[5,4,17.5],[9,2,16.5],[15,4,17.9]].map(x=>at(...x).zone), B=[[5,1,16.5],[5,5,18.5],[4,2,16.5],[16,2,16.5]].map(x=>at(...x).zone);
    check('6. 沛珊作息：大一下第 5～15 週週二、四 16:00～18:00 在溫州街（課輔班）',A.every(z=>z==='wenzhou'),J(A));
    check('6. 對照：週一、五 16～19 照舊在總圖；第 4 週週二照舊在總圖；第 16 週週二（4/6～6/14 和柏翰那一段）＝總圖大廳二樓自習區（AA_527 2-5，原本三樓閱覽區）',J(B)===J(['library','library','library','library_hall']),J(B));
    const T=evText('ev_peishan_tutoring'); check('6. 溫州街課輔班（P3b）：「喔，是你。我在這裡當志工。一週兩天。」',T.includes('喔，是你。我在這裡當志工。一週兩天。')&&!T.some(t=>/一週三天/.test(t)),J(T.slice(0,2)));
    const L3=LADDER.byTerm.Y1S2.classmate_peishan.steps.find(s=>s.id==='P2-L3');
    check('6. 閒聊階梯 P2-L3：「我在溫州街的課輔班當志工。一週兩天。」',!!L3&&L3.lines[0]==='我在溫州街的課輔班當志工。一週兩天。',L3&&L3.lines[0]);
    fresh(termDay('Y1S2',6,2),17,'wenzhou',{}); R('classmate_peishan','FAM'); const g=[]; for(let i=0;i<6;i++){ const t=STORY.ladGreet(G,'classmate_peishan'); if(t) g.push(t); }
    check('6. 第 6 週週二 17:00 她在溫州街，招呼「（她帶著一排小孩過馬路，對你點頭）……等一下！」接得上（她真的在那裡）',STORY.schedEnt(ps,G).zone==='wenzhou'&&g.includes('（她帶著一排小孩過馬路，對你點頭）……等一下！'),J(g)); }
  // ===== 第 7 項＋BB-5：語彤大一下期末邀約「禮拜五」=====
  { const inv=(term,kind)=>{ const w=TERMEND.windowOf(term); fresh(w.from,20,'dorm',{}); R('heroine_03','FRI'); TERMEND.rec(G,term).plan={back:w.from,heart:kind==='heart'?['heroine_03']:[],friend:kind==='friend'?['heroine_03']:[],fallback:null,gf:[],nope:{},kx:false};
      G.hour=20.9; TERMEND.phone(GM); PHONE.tick(G); const m=(G.msgs||[]).find(x=>x.tag==='te_'+term+'_heroine_03'); return m?m.text:null; };
    const f=inv('Y1S2','friend'), h=inv('Y1S2','heart');
    check('7／BB-5. 語彤大一下期末邀約（一般）：「考完了。禮拜五，要吃飯嗎。」',f==='考完了。禮拜五，要吃飯嗎。',f);
    check('7／BB-5. 語彤大一下期末邀約（心意）：「禮拜五晚上我有空。……店裡打烊以後，我煮。只有我們。」',h==='禮拜五晚上我有空。……店裡打烊以後，我煮。只有我們。',h);
    check('7. 對照：大二上照舊「禮拜四」（一般、心意）',inv('Y2S1','friend')==='考完了。禮拜四，阿姨說要煮火鍋。'&&inv('Y2S1','heart')==='禮拜四我沒顧店。……店裡打烊以後，我煮。只有我們。');
    const w=TERMEND.windowOf('Y1S2'); fresh(w.from,20,'dorm',{}); const dd=TERMEND.dinnerDay(G,w,{h:19,wd:4},'heroine_03');
    check('7. 對照：大一下語彤的飯在 6/19（五）（6/18 雙主修筆試）',K(dd)==='2026-06-19',K(dd)); }
  // ===== 第 8、14 項：學姊 S2-L6、以安的招呼 =====
  { const S=LADDER.byTerm.Y1S2.heroine_05.steps.find(s=>s.id==='S2-L6');
    check('8. 學姊 S2-L6：「上學期期中的時候，我對著空的保溫瓶喝了好幾次。」',!!S&&S.lines[0]==='上學期期中的時候，我對著空的保溫瓶喝了好幾次。',S&&S.lines[0]);
    check('8. 學姊 S2-L6（買過黑咖啡的）：「那杯黑咖啡，謝謝。」（不說「上次」）',!!S&&S.linesIf[0].lines[0]==='那杯黑咖啡，謝謝。',S&&S.linesIf[0].lines[0]);
    const A=(LADDER.byTerm.Y1S2.heroine_01.greet.when||[]).find(x=>J(x.week)===J([10,15]));
    check('14. 以安第 10～15 週的招呼：「日文課下禮拜小考。……片假名我還是會看錯。」（交換是大三的伏筆）',!!A&&A.t==='日文課下禮拜小考。……片假名我還是會看錯。',A&&A.t);
    const allow=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>/AA_373_/.test(e.path));
    check('6／8／9／14／25. 匯入白名單有一筆 AA_373（approved、AA373-Y1S2-FIX-1021；a48fe1b7 → bdab2f42（加第 6 節）→ e75d1cce（6-1 那一列兩欄改整句），舊的記在 history）；ladder.js、syllabus.js 的來源寫著同一個版本',allow.length===1&&['bdab2f42','e75d1cce'].includes(allow[0].sha)&&(allow[0].history||[]).some(h=>h.sha==='a48fe1b7')&&allow[0].status==='approved'&&allow[0].task==='AA373-Y1S2-FIX-1021'&&LADDER.source.includes('AA_373@'+allow[0].sha)&&SYLLABUS.source.includes('AA_373@'+allow[0].sha),J(allow.map(e=>e.sha))); }
  // ===== 第 9 項：通識第 6 週天文館的圓頂 =====
  { const w6=(SYLLABUS.courses.ge_y1s2||[]).find(w=>w.w===6)||{}, rc=(w6.react||[]).map(r=>r.who+':'+r.text), pre=(CLS.SPECIAL_PRE||{})['ge_y1s2|6'];
    check('9／第 6-2 節第 3 題. 旁白「（這堂課移到天文館。）」「（天文館的圓頂關了燈。）」（黑板之後、老師那句之前）',J(pre)===J([[null,'（這堂課移到天文館。）'],[null,'（天文館的圓頂關了燈。）']]),J(pre));
    check('9. 宥辰「關了燈的課，我最清醒。」；「圓頂裡很暗。你……」',rc.includes('classmate_youchen:關了燈的課，我最清醒。')&&!rc.some(t=>/晚上的課/.test(t))&&!!w6.obs&&w6.obs.prompt==='圓頂裡很暗。你……',J([rc,w6.obs&&w6.obs.prompt]));
    check('9. 對照：老師那句「先讓眼睛習慣黑暗。至少十分鐘。」不改；「連假的時候，我要去山上看星星。」照留（春假看星星靠這一堂）',w6.line==='先讓眼睛習慣黑暗。至少十分鐘。'&&rc.includes('class:連假的時候，我要去山上看星星。')); }
  // ===== 第 10 項：3/2、2/14、第一次「我們的日子」=====
  { const m2=termDay('Y1S2',2,1); fresh(m2,20.9,'dorm',{dating_kexin:true,KX_VDAY_SEE:true}); run(20.9,21.1); const L=txt('p:kexin');
    check('10. 3/2 21:00（情人節說想見她的）：「你情人節說想見我。這個週末我已經空下來了。」',L.includes('你情人節說想見我。這個週末我已經空下來了。')&&!L.some(t=>/開學第一個週末/.test(t)),J(L));
    const V=evText('ev_kexin_valentine_y1'); check('10. 2/14 視訊選「我不知道。我想見妳。」：「開學第二個週末。我寫進行事曆了。」',V.includes('開學第二個週末。我寫進行事曆了。')&&!V.some(t=>/開學第一個週末/.test(t)));
    const first=(dk)=>{ fresh(m2,21.3,'dorm',{dating_kexin:true,KX_VDAY_SEE:true}); run(21,21.1); G.flags._kxOD=dk; G.flags._kxOM='mid'; run(21.2,21.3); const q=OUT.get(G,'kx_our_day1'); return q?K(q.day):null; };
    const f=['sat','sun','fri'].map(first);
    check('10. 對照：第一次「我們的日子」在第 2 週（3/2 回覆：週六 3/7、週日 3/8；週五晚上 3/6）',J(f)===J(['2026-03-07','2026-03-08','2026-03-06']),J(f)); }
  // ===== 第 11 項：春假 =====
  { const T=evText('ev_kexin_trip_spring_y1');
    check('11. 春假車上：「誰都不能管對方的。……第三頁寫的，今天不算。目的地，現在決定。」',T.includes('誰都不能管對方的。……第三頁寫的，今天不算。目的地，現在決定。')&&!T.includes('誰都不能管對方的。……目的地，現在決定。'));
    check('11. 選看星星：「看星星？……你們這禮拜上了什麼課？好，我們去驗證。」（沒人告訴過她通識課的事）',T.includes('看星星？……你們這禮拜上了什麼課？好，我們去驗證。')&&!T.some(t=>/你們通識課的人說的/.test(t))); }
  // ===== 第 12 項：方奕廷 =====
  { const one=term=>{ const w=TERMEND.windowOf(term); fresh(w.from,20,'dorm',{}); R('npc_fangyt','FAM'); TERMEND.rec(G,term).plan={back:w.from,heart:[],friend:['npc_fangyt'],fallback:null,gf:[],nope:{},kx:false};
      G.hour=20.6; TERMEND.phone(GM); PHONE.tick(G); const m=(G.msgs||[]).find(x=>x.tag==='te_'+term+'_npc_fangyt'); return m?m.text:null; };
    const a=one('Y1S2'), b=one('Y2S2');
    check('12. 方奕廷大一下 6/11 的期末邀約：「考完了嗎？吃個飯。七月我就要上山了。」（他 7/6 才上山）',a==='考完了嗎？吃個飯。七月我就要上山了。',a);
    check('12. 對照：大二下照 AA_369 L1「考完了嗎？吃個飯，七月我要上山兩個禮拜。」',b==='考完了嗎？吃個飯，七月我要上山兩個禮拜。',b); }
  // ===== 第 13 項：明軒家教 =====
  { const dp=(STORY.DAILY_PHONE||[]).find(x=>x.id==='mx_tutor_y1s2'), T=dp?dp.items(G).map(x=>x.text):[];
    check('13. 明軒家教手機小事：「你們考試也快了吧 加油」（期中、期末都通）',J(T)===J(['今天家教的學生段考考完了 終於可以喘一下 哈哈','你們考試也快了吧 加油']),J(T)); }
  // ===== 第 15、16 項：期中晚餐 =====
  { const sup=async know=>{ fresh(D('2026-04-15'),19,'gongguan',{}); R('zhe','FAM'); if(know) R('heroine_03','FAM'); said=[]; await EVENTS.run(ev('ev_midterm_supper_y1s2')); return lines(); };
    const a=await sup(false), b=await sup(true);
    check('15. 期中晚餐（4/15），還沒認識語彤：「（阿姨的手腕綁著護腕。今天端麵的是一個沒見過的女生。）」',a.includes('（阿姨的手腕綁著護腕。今天端麵的是一個沒見過的女生。）')&&!a.some(t=>/端麵的是語彤/.test(t)),J(a.slice(0,2)));
    check('15. 對照：認識語彤的照舊「（阿姨的手腕綁著護腕。今天端麵的是語彤。）」',b.includes('（阿姨的手腕綁著護腕。今天端麵的是語彤。）')&&!b.some(t=>/沒見過的女生/.test(t)),J(b.slice(0,2)));
    fresh(D('2026-04-15'),21,'dorm',{}); R('classmate_peishan','FAM'); PHONE.join(G,'noodle_team','麵店團'); ev('ev_midterm_supper_y1s2').outingMissed(G,GM,{day:G.day,h:19}); PHONE.tick(G);
    const M=TH('g:noodle_team').filter(m=>m.tag==='zhe_supper_mid2_egg').map(m=>m.from+':'+m.text);
    check('16. 期中晚餐沒去（認識沛珊）：麵店團群組阿哲傳滷蛋照片，配「柏翰幫沛珊切的」「……他們在一起了」（不再只有「……喔。」）',J(M)===J(['zhe:📷（一顆切成兩半的滷蛋）','zhe:柏翰幫沛珊切的','zhe:……他們在一起了']),J(M)); }
  // ===== 第 17 項：「那場演講。」=====
  { const thu=termDay('Y1S2',11,4);
    const b4=ans=>{ fresh(thu,21.9,'dorm',{dating_kexin:true}); G.acts={att:{['B4@'+thu]:{end:'full'}}}; run(22,22.1); const m=(G.msgs||[]).find(x=>x.tag==='kx_b4_ask'&&x.ask); if(m&&ans!=null) PHONE.answer(G,m.ask.id,ans);
      const ch=(ev('ev_revisit_y1_kexin').dialogue||[]).find(l=>l&&Array.isArray(l.choice)&&l.choice.some(c=>/那場演講/.test(c.text))), o=ch&&ch.choice.find(c=>/那場演講/.test(c.text));
      return {opt:m&&m.ask.opts[0].t,shown:!!(o&&o.if&&o.if.custom&&o.if.custom(G))}; };
    const a=b4(0), b=b4(1), c=b4(null);
    check('17. 對照：5/7 回過她「講者最後問：『被限制的那個人，最後可以去哪裡？』」：期末河堤照樣有「那場演講。」',/^講者最後問/.test(a.opt||'')&&a.shown,J(a));
    check('17. 聽完 B4、5/7 回的是別的（被點名？）或沒回：「那場演講。」不出（她回「你說講者最後問的那一題…」接不上）',!b.shown&&!c.shown,J([b,c])); }
  // ===== 第 18 項：芷若大一下期末飯 22:00 =====
  { const din=term=>{ const w=TERMEND.windowOf(term); fresh(w.from,20,'dorm',{}); R('heroine_02','FRI'); TERMEND.planDinner(G,w,'heroine_02','friend'); const q=OUT.get(G,'te_'+term); return q?[K(q.day),q.h]:null; };
    const a=din('Y1S2'), b=din('Y1S1');
    check('18. 芷若大一下期末邀約「考完了嗎？我下班以後，吃個東西？」：22:00（她晚班到 22:00）',!!a&&a[1]===22,J(a));
    check('18. 大一上也一樣（AA_373 第 6 節第 9 題「統一」，企劃線 bdab2f42）：「這禮拜五我十點下班。要不要吃宵夜？」22:00',!!b&&b[1]===22&&TERMEND_LINES.FRIEND.heroine_02.y1s1==='這禮拜五我十點下班。要不要吃宵夜？',J(b)); }
  // ===== 第 19 項：總圖十點關 =====
  { const dp=(STORY.DAILY_PHONE||[]).find(x=>x.id==='y1s2_bohan_closed'), T=dp?dp.items(G).map(x=>x.from+':'+x.text):[];
    check('19. 麵店團手機小事：22:10 柏翰「總圖十點關。」「我被趕出來了。」、阿哲「你根本住那裡吧」',!!dp&&Math.abs(dp.h()-(22+10/60))<1e-9&&J(T)===J(['classmate_bohan:總圖十點關。','classmate_bohan:我被趕出來了。','zhe:你根本住那裡吧']),J([dp&&dp.h(),T])); }
  // ===== 第 23 項：活大 =====
  { fresh(termDay('Y1S2',5,5),12.75,'campus',{}); const z=STORY.schedEnt(CHARACTERS.econ_zhengxun,G), p=STORY.schedEnt(CHARACTERS.econ_pinyu,G);
    check('23. 阿勳、品妤大一下週五中午：人物線索「在活大吃午餐」（小福已拆）',!!z&&z.away==='在活大吃午餐'&&!!p&&p.away==='在活大吃午餐',J([z&&z.away,p&&p.away])); }
  // ===== 第 24 項：沛珊 P2「這半年」=====
  { const dbt=async day=>{ fresh(day,15,'library',{}); R('classmate_peishan','FAM'); picks=['妳呢']; said=[]; await EVENTS.run(ev('ev_peishan_doubt')); return lines(); };
    const a=await dbt(termDay('Y1S1',8,3)), b=await dbt(termDay('Y1S2',3,3));
    check('24. 大一下才演的 P2：「我在旁聽哲學系的課。上禮拜坐在那間教室，比坐在霖澤館這半年都自在。」',b.includes('我在旁聽哲學系的課。上禮拜坐在那間教室，比坐在霖澤館這半年都自在。')&&!b.some(t=>/一個多月/.test(t)),J(b.filter(t=>/霖澤館/.test(t))));
    check('24. 對照：大一上照原句「…比坐在霖澤館這一個多月都自在。」',a.includes('我在旁聽哲學系的課。上禮拜坐在那間教室，比坐在霖澤館這一個多月都自在。')&&!a.some(t=>/這半年/.test(t)),J(a.filter(t=>/霖澤館/.test(t)))); }
  // ===== 第 25、26 項＋BB-4：可昕不比輸贏 =====
  { const w7=termDay('Y1S2',7,3); fresh(w7,20.9,'dorm',{dating_kexin:true}); run(21,21.1); const L=txt('p:kexin');
    check('25、26／BB-4. 4/8 21:00：「考完去吃山下那攤，我請。下週六下午可以嗎？」（沒有「輸的請」；下週六＝4/18）',L.includes('考完去吃山下那攤，我請。下週六下午可以嗎？')&&!L.some(t=>/輸的請/.test(t)),J(L));
    const quiz=async(mode,pick)=>{ fresh(termDay('Y1S2',8,7),14,'gongguan',{dating_kexin:true,KX_QUIZ_MODE:mode}); picks=[pick]; said=[]; await EVENTS.run(ev('ev_kexin_reschedule')); return lines(); };
    const m=await quiz('meet','中等'), h=await quiz('meet','冷門'), v=await quiz('video','中等');
    const bad=t=>/你贏|你請|她判你輸|輸的請|我會比/.test(t);
    check('25／BB-4. 4/19 互考選「中等的」：「……一半。回去我再讀一次。」「走，山下那攤。」（沒有「你贏」「我請」）',m.includes('……一半。回去我再讀一次。')&&m.includes('走，山下那攤。')&&!m.some(bad)&&!m.includes('……好，你贏。我請。'),J(m));
    check('25／BB-4. 選「冷門的」：「犯規。冷門學說是犯規。」「（她把那一題劃掉。）」「……下一題。」（沒有「她判你輸。」「你請。」）',J(h.slice(-3))===J(['犯規。冷門學說是犯規。','（她把那一題劃掉。）','……下一題。'])&&!h.some(bad),J(h));
    check('25／第 6-2 節第 8 題. 視訊互考選「中等的」：沒有「走，山下那攤。」（人不在政大），換成「……下次見面，山下那攤。」',v.includes('……一半。回去我再讀一次。')&&!v.includes('走，山下那攤。')&&v.includes('……下次見面，山下那攤。'),J(v));
    const K2=LADDER.byTerm.Y1S2.kexin.steps.find(s=>s.id==='K2-L1'), r=K2&&K2.choices.find(c=>/我也有記/.test(c.t));
    check('25. K2-L1 選「我也有記。」：「騙人。……你記幾次？算了，不准說。」（沒有「我會比」）',!!r&&r.reply==='騙人。……你記幾次？算了，不准說。',r&&r.reply);
    check('25. 對照：互考照留（4/8 的邀約、4/19 的事件、KX_QUIZ 照記）',!!ev('ev_kexin_reschedule')&&L.includes('期中前，兩校互考。')&&(()=>{ const Q=G.flags.KX_QUIZ; return !!Q&&(Q.win|0)+(Q.lose|0)+(Q.draw|0)===1; })(),J(G.flags.KX_QUIZ)); }
  // ===== 第 6 節（企劃線 bdab2f42；AA 22:0x 答 LAWWW 21:44 的比輸贏清單＋十二題）=====
  { const quiz=async(mode,pick)=>{ fresh(termDay('Y1S2',8,7),14,'gongguan',{dating_kexin:true,KX_QUIZ_MODE:mode}); picks=[pick]; said=[]; await EVENTS.run(ev('ev_kexin_reschedule')); return lines(); };
    const e=await quiz('meet','簡單'), ev2=await quiz('video','簡單');
    check('第 6-1 節. 互考選「簡單的」：「兩個都對。……走，山下那攤。」（不是「平手。各付各的。」）',e.includes('兩個都對。……走，山下那攤。')&&!e.some(t=>/平手|各付各的/.test(t)),J(e));
    check('第 6-1 節／第 6-2 節第 8 題. 視訊互考選「簡單的」：「兩個都對。……下次見面，山下那攤。」（人不在政大）',ev2.includes('兩個都對。……下次見面，山下那攤。')&&!ev2.includes('兩個都對。……走，山下那攤。')&&!ev2.some(t=>/平手/.test(t)),J(ev2));
    const sum1=CALENDAR.gradeDay('Y1S2'); fresh(sum1,20.9,'dorm',{dating_kexin:true,KX_GRADES_Y1S2:'best_one'}); run(20.9,21.1);
    const m=(G.msgs||[]).find(x=>x.tag==='kx_best_one'&&x.ask), k=m?m.ask.opts.findIndex(o=>o.set&&o.set.KX_BEST_ONE_Y1S2!=='econ_principles_2'):-1; if(m&&k>=0) PHONE.answer(G,m.ask.id,k); const last=txt('p:kexin').slice(-1)[0]||'';
    check('第 6-1 節. 6/29 各說一科（kx_best_one）：「「…」。好，我記下來了。……明年再各說一科。」（不是「明年再比一次」）',!!m&&/。好，我記下來了。……明年再各說一科。$/.test(last)&&!txt('p:kexin').some(t=>/再比一次/.test(t)),last);
    const r7=evText('ev_y0_r7'), p2b=evText('ev_y0_p2b');
    check('第 6-1 節. 經濟系 ev_y0_r7：「宵夜你請。……上次是我請的。」（不比分數）',r7.includes('宵夜你請。……上次是我請的。')&&!r7.some(t=>/分數比較低/.test(t)),J(r7.filter(t=>/宵夜/.test(t))));
    check('第 6-1 節. 經濟系 ev_y0_p2b：「那是我的第一次，不是你的。……好，聽你的。」（不是「算你贏」）',p2b.includes('那是我的第一次，不是你的。……好，聽你的。')&&!p2b.some(t=>/算你贏/.test(t)),J(p2b.filter(t=>/第一次，不是你的/.test(t))));
    const src=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
    check('第 6-1 節. 對照（照留）：大二成績打賭「你輸了。」「我輸了。」「上次你請。這次你也會請。」「成績那一攤，你請。說好的。」；休學在家比早起；「那今天宵夜誰請？」「好，那下週換你請。」',
      ['你輸了。','我輸了。','上次你請。這次你也會請。','成績那一攤，你請。說好的。'].every(t=>src('src/y2r2_3d.js').includes(t))&&/今天算你贏/.test(src('src/data/retake_home.js'))&&src('src/data/r2y4a_events.js').includes('那今天宵夜誰請？')&&src('src/story3d.js').includes('好，那下週換你請。')); }
  { const w6=(SYLLABUS.courses.ge_y1s2||[]).find(w=>w.w===6)||{}, ob=((w6.obs||{}).options||[]).find(o=>o.text==='看旁邊的人'), pre=(CLS.SPECIAL_PRE||{})['ge_y1s2|6']||[];
    check('第 6-2 節第 3 題. 通識第 6 週：黑板「（本週在天文館）」（不是「（本週晚上在操場）」）；觀察「看旁邊的人」＝「宥辰仰著頭，一直到燈亮都沒有說話。」；開頭旁白「（這堂課移到天文館。）」',
      (w6.board||[])[1]==='（本週在天文館）'&&!(w6.board||[]).some(t=>/操場/.test(t))&&!!ob&&ob.result==='宥辰仰著頭，一直到燈亮都沒有說話。'&&!!pre[0]&&pre[0][1]==='（這堂課移到天文館。）',J([w6.board,ob,pre]));
    const S6=LADDER.byTerm.Y1S2.heroine_05.steps.find(s=>s.id==='S2-L6'), fl=S6&&(S6.linesIf||[]).find(x=>x.if&&J(x.if).includes('ev_sis_empty_flask'));
    check('第 6-2 節第 4 題. 學姊 S2-L6 看過空保溫瓶那一套：「上學期期中那個空的保溫瓶，你看到了。」',!!fl&&fl.lines[0]==='上學期期中那個空的保溫瓶，你看到了。',fl&&fl.lines[0]);
    const h2=TERMEND.heart('heroine_03','Y1S2'), h3=TERMEND.heart('heroine_03','Y2S1');
    check('第 6-2 節第 7 題. 語彤大一下心意第二次：「禮拜五。打烊以後。……你上次說要想，想好了嗎。」（對照：大二上照舊「禮拜四」）',!!h2&&h2.invite2==='禮拜五。打烊以後。……你上次說要想，想好了嗎。'&&!!h3&&h3.invite2==='禮拜四。打烊以後。……你上次說要想，想好了嗎。',J([h2&&h2.invite2,h3&&h3.invite2]));
    const dbt=async day=>{ fresh(day,15,'library',{}); R('classmate_peishan','FAM'); picks=['妳呢']; said=[]; await EVENTS.run(ev('ev_peishan_doubt')); return lines().filter(t=>/霖澤館/.test(t)); };
    const y2=await dbt(termDay('Y2S1',3,3));
    check('第 6-2 節第 10 題. 大二上才第一次演沛珊 P2：「…比坐在霖澤館這一年多都自在。」（不是「這半年」「這一個多月」）',J(y2)===J(['我在旁聽哲學系的課。上禮拜坐在那間教室，比坐在霖澤館這一年多都自在。']),J(y2));
    const at=(key,h,id)=>{ fresh(D(key),h,'campus',{}); const e=STORY.schedEnt(CHARACTERS[id],G); return e&&e.away; };
    check('第 6-2 節第 11 題. 4/3 08:00 出發～4/4 16:30 回來：Alison、阿哲、以安的人物線索「麵店團春假旅行」；4/2、4/4 晚上不是',['yu','zhe','heroine_01'].every(id=>at('2026-04-03',12,id)==='麵店團春假旅行'&&at('2026-04-04',10,id)==='麵店團春假旅行'&&at('2026-04-04',18,id)!=='麵店團春假旅行'&&at('2026-04-02',12,id)!=='麵店團春假旅行'),J(['yu','zhe','heroine_01'].map(id=>[at('2026-04-03',12,id),at('2026-04-04',10,id),at('2026-04-04',18,id)])));
    const badEv=STORY_EVENTS.filter(e=>(e.stage||'law')!=='econ'&&!e.retired&&!(e.term&&e.term.every(t=>/^Y0|^Y1S1$/.test(t)))&&J(e.dialogue||[]).includes('小福'));
    const badSch=Object.keys(CHARACTERS).filter(id=>(CHARACTERS[id].daily_schedule||[]).some(x=>/小福/.test(x.away||x.label||'')&&!(x.terms&&x.terms.every(t=>/^Y0|^Y1S1$/.test(t)))));
    check('第 6-2 節第 12 題（對照：第一輪 #23 已經改好，這裡確認沒有漏的）. 大一下以後玩家看得到的「小福」都改成「活大」（大一上照舊）：法律系的事件、作息的人物線索都沒有大一下以後的「小福」',!badEv.length&&!badSch.length,J({badEv:badEv.map(e=>e.id),badSch})); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
