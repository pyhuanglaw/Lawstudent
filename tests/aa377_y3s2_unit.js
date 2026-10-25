// AA_377（企劃線 b7c437a1；AA 2026-10-21 定稿）法律系大三下（臺灣、日本、美國三條路線）：時間、人在哪、作廢設定——不需要瀏覽器。任務 AA377-Y3S2-FIX-1021。
//   1 日本路線比較行政法照日期（4/13～5/5 兩句輪流、5/6 以後第一堂一次町公所、拿掉期末報告那句）　2 哲 4 日本版跳轉照當地時間、「臺灣十二點」
//   3 公法讀書會大三下整學期（期中週停）、芯慈「讀書會你的位子」、以安「讀書會 Alison」要參加過讀書會　4 以安租公寓（訊息、視訊、群組、階梯 A6-L2）
//   5 以安在日本的訊息池照日期（櫻花只在 4 月、期中只在第 8～9 週、「這禮拜的課很難」7/21 以前）　7 挽回中：A6 整層略過、餞行、228 旁白
//   8 芷若大三下只排週三、四 19:00～22:00（＝階梯的 workShifts）、期末心意／朋友邀約　10 子晴「你考完了吧」　11 芷若「六月的週五」「幫忙一個月」　12 「第六週」
//   13 可昕 5/3 日本版　14 柏翰日本版　15 語彤 Y6-L1 一起做過田野　16 語彤 Y6-L4 沒有田野的發現　17 3/28 摘要（3/25 就入住）　18 床墊「不知道誰的課表」　19 以安 4/13 視訊日本 22:00
//   6 語彤 Y6-L3 和祐廷拍的杜鵑花（AN3_AZALEA；第 6-3 節四種玩家、「（給她看手機裡的另一張）」）　9 民訴 civpro_2 第 14 週拿掉作廢的模擬法庭（第 6-1 節言詞辯論的練習）、第 15 週板書
//   第 20 項是 AA 改自己的補稿（不在遊戲裡）。台詞逐字比對企劃線的稿（git show eab1eba3；第 1～5 節和 b7c437a1 一字不差，第 6 節是 AA 回 LAWWW 的三題）。修改前（開發分支 c69c91a5）：第 2～19 項 29 個 FAIL（第 1 項在 014a38bc 已經做好，照樣通過；標「對照」的照樣通過）。用法：node tests/aa377_y3s2_unit.js
require('./alison.js');   /* AA_380：企劃線的舊稿還寫「小語」，讀稿的時候照匯入工具換成 Alison */
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
global.CG_REGISTRY={};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/classes3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/data/needed_msgs.js','src/data/hometown_lines.js','src/msg3d.js',
  'src/data/y2b_events.js','src/y2b3d.js','src/data/group_events.js','src/group3d.js','src/y34b3d.js','src/data/r2y3a_events.js','src/r2y3a3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/jp_events.js','src/jp3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const sec=async(name,f)=>{ try{ await f(); }catch(e){ check(name+'（例外）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' | ')); } };
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[],spots:{}},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },syncWeekday(){ G.weekday=wdOf(G.day); },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const D=k=>STORY.dayOfKey(k);
const fresh=(key,hour,zone,flags)=>{ const day=D(key); G={v:3,day,hour,zone:zone||'dorm',stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true,ROOM_Y2:true,ROOM_Y3:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{},msgs:[]};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; ADV.active=false; return G; };
const LV={FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv]; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const date=id=>{ G.flags['dating_'+id]=true; ROM.get(G,id).status='dating'; SOCIAL.remember(id,'FIRST_MET',''); };
const ex=id=>{ delete G.flags['dating_'+id]; ROM.get(G,id).status='ex'; };
const all=()=>said.map(s=>s.t), has=t=>said.some(s=>s.t===t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const play=async(id,pk)=>{ said=[]; opts=[]; picks=(pk||[]).slice(); await EVENTS.run(ev(id)); return all(); };
const txt=th=>(G.msgs||[]).filter(m=>m.th===th).map(m=>m.text);
const J=JSON.stringify;
const PDOC='docs/story_planning/AA_377_法律系大三下_三條路線_修正稿.md';
let MD=''; try{ MD=cp.execSync('git show eab1eba3:"'+PDOC+'"',{cwd:process.env.PG_DOC_REPO||ROOT,encoding:'utf8'}); }catch(e){ MD=''; }
const inMD=t=>MD.indexOf(t)>=0;
(async()=>{
  await sec('0',async()=>{
    check('0. 讀得到稿（企劃線 eab1eba3 AA_377，含第 6 節）',MD.length>3000&&inMD('AA_377')&&inMD('## 6. 回 LAWWW'));
    const A=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(f=>f.path===PDOC);
    check('0. 匯入白名單：AA_377@d037c668（approved，一個版本；第 7 節回 LAWWW 02:50 七題；eab1eba3、b7c437a1 在 history）',A.length===1&&A[0].sha==='d037c668'&&A[0].status==='approved'&&['eab1eba3','b7c437a1'].every(s=>(A[0].history||[]).some(h=>h.sha===s)),J(A.map(a=>a.sha))); });
  /* ---- 1 日本路線比較行政法 ---- */
  await sec('1',async()=>{
    const L1='（教授的日文很快。你只抓得到一半，筆記上一半是問號。）', L2='（旁邊的日本同學把筆記推過來給你看。字很小，很整齊。）', TOWN='今天講行政指導。你想起以安說的町公所。';
    check('1. 讀稿：兩句新的、町公所那句、拿掉的那句都在稿裡',inMD(L1)&&inMD(L2)&&inMD(TOWN)&&inMD('「期末報告的題目，你寫了三次才寫定。」拿掉'));
    fresh('2028-04-13',12.5,'jp_hub',{EXCHANGE_ROUTE:'JP',JP_DEPARTED:D('2028-03-25')}); date('heroine_01');
    const at=async key=>{ G.day=D(key); G.hour=12.5; G.weekday=wdOf(G.day); const it=JP.classesOn(G,G.day).find(x=>x.c.id==='jp_comp_admin'); said=[]; if(!it) return null; await JP.attend(GM,it); return all().slice(-1)[0]; };
    const a=await at('2028-04-13'), b=await at('2028-04-20'), c=await at('2028-04-27'), d=await at('2028-05-11'), e=await at('2028-05-25'), f=await at('2028-06-01');
    check('1. 4/13～4/27 兩句輪流（第一堂不提町公所）',a===L1&&b===L2&&c===L1,J([a,b,c]));
    check('1. 5/6 以後第一堂（5/11）出一次「想起以安說的町公所」；之後回到兩句輪流（5/25、6/1）',d===TOWN&&e===L2&&f===L1,J([d,e,f]));
    const C=JP.CLASSES.find(x=>x.id==='jp_comp_admin'); check('1. 課的句子裡沒有「期末報告的題目，你寫了三次才寫定。」',!J(C).includes('期末報告的題目，你寫了三次才寫定。')); });
  /* ---- 2 哲 4 日本版 ---- */
  await sec('2',async()=>{
    check('2. 讀稿：兩句旁白（片段）在稿裡',inMD('你們講到臺灣十二點半。你這邊已經一點半。')&&inMD('臺灣十二點，你這邊一點。他把手機拿起來。'));
    fresh('2028-04-29',0,'jp_hub',{EXCHANGE_ROUTE:'JP',JP_DEPARTED:D('2028-03-25'),ZHE4_REPLY:'jp'}); R('zhe','FRI'); const d0=G.day;
    let L=await play('ev_zhe_said_it',[0]);
    check('2. 日本版選「嗯。我在。」：「你們講到臺灣十二點半。你這邊已經一點半。」、時間到當地 1:30（還是 4/29）',L.includes('（他把紅茶喝完。你們講到臺灣十二點半。你這邊已經一點半。他講了很多，大部分是高雄、他爸、高中的球隊。）')&&!L.includes('（他把紅茶喝完。你們講到十二點半。他講了很多，大部分是高雄、他爸、高中的球隊。）')&&G.day===d0&&Math.abs(G.hour-1.5)<0.02,J({h:G.hour,L:L.slice(-3)}));
    fresh('2028-04-29',0,'jp_hub',{EXCHANGE_ROUTE:'JP',JP_DEPARTED:D('2028-03-25'),ZHE4_REPLY:'jp'}); R('zhe','FRI');
    L=await play('ev_zhe_said_it',[2]);
    check('2. 日本版選坐著：「臺灣十二點，你這邊一點。他把手機拿起來。」、時間到當地 1:00',L.includes('（他也沒說話。臺灣十二點，你這邊一點。他把手機拿起來。）')&&Math.abs(G.hour-1)<0.02,J({h:G.hour,L:L.slice(-3)}));
    fresh('2028-04-28',23.3,'dorm',{ZHE4_REPLY:'home'}); R('zhe','FRI'); L=await play('ev_zhe_said_it',[0]);
    check('2. 在家的視訊版照舊：「你們講到十二點半」、到臺灣 0:30',L.includes('（他把紅茶喝完。你們講到十二點半。他講了很多，大部分是高雄、他爸、高中的球隊。）')&&Math.abs(G.hour-24.5)<0.02,J({h:G.hour})); });
  /* ---- 3 公法讀書會大三下整學期 ---- */
  await sec('3',async()=>{
    const PL=ACTIVITIES.list.find(a=>a.id==='public_law_group'), T=CALENDAR.termDays('Y3S2'), wkThu=w=>{ for(let d=T.from;d<=T.to;d++){ const t=CALENDAR.termOf(d); if(t&&t.week===w&&wdOf(d)===4) return d; } return null; };
    fresh('2028-03-30',19,'dorm');
    const on=w=>{ const d=wkThu(w); G.day=d; G.weekday=4; return ACTIVITIES.on(PL,d,G); };
    check('3. 大三下第 1～7、10～15 週開，第 8、9（期中）、16 週不開（原本只開到第 5 週）',[1,5,6,7,10,15].every(on)&&![8,9,16].some(on),J([1,5,6,7,8,9,10,15,16].map(w=>[w,on(w)])));
    const xc=ev('ev_far_call_jp').dialogue.find(n=>n.text==='讀書會你的位子，我們沒有人坐。');
    fresh('2028-04-13',20.5,'jp_hub',{EXCHANGE_ROUTE:'JP',JP_DEPARTED:D('2028-03-25')}); PHONE.join(G,'noodle_team','麵店團'); R('classmate_xinci','FRI'); const a=EVENTS.cond(xc.if);
    ACTIVITIES.rec(G).att['public_law_group@'+D('2028-02-24')]={h:20,end:'full'}; const b=EVENTS.cond(xc.if);
    check('3. 芯慈「讀書會你的位子，我們沒有人坐。」只給參加過讀書會的',!!xc&&a===false&&b===true,J({a,b}));
    fresh('2028-04-16',20,'dorm'); const c=R2Y3B.AB_WHEN.t2[2](G,G.day); ACTIVITIES.rec(G).att['public_law_group@'+D('2028-02-24')]={h:20,end:'full'}; const d=R2Y3B.AB_WHEN.t2[2](G,G.day);
    check('3. 以安「讀書會 Alison 有沒有好好排題目？」那則只給參加過讀書會的',R2Y3B_EVENTS.AB.t2[2].L[0].indexOf('讀書會 Alison 有沒有好好排題目？')===0&&c===false&&d===true,J({c,d})); });
  /* ---- 4 以安租公寓 ---- */
  await sec('4',async()=>{
    const AB=R2Y3B_EVENTS.AB, jpTxt=J(JP_EVENTS||STORY_EVENTS), A62=LADDER.byTerm.Y3S2.heroine_01.steps.find(s=>s.id==='A6-L2');
    check('4. 讀稿：公寓的六處都在稿裡',['（照片：公寓的投幣洗衣機）一次一百圓。','我回房間查字典','（畫面裡是她房間的書桌…）','理由：公寓的走廊晚上會有回音','房東寄來的信，我還看不太懂','公寓的垃圾分六種'].every(inMD));
    check('4. 訊息、視訊：「公寓的投幣洗衣機」、「我回房間查字典」、「她房間的書桌」',AB.t1[3][0]==='（照片：公寓的投幣洗衣機）'&&AB.t1[3][1]==='一次一百圓。我記在手帳了。'&&AB.t2[0].L[0]==='上課聽懂七成了。剩下三成，我回房間查字典。'&&AB.t3[0][0].text==='（畫面裡是她房間的書桌，手帳攤在旁邊。）',J([AB.t1[2],AB.t2[0].L[0],AB.t3[0][0]]));
    const evTxt=J(STORY_EVENTS);
    check('4. 日本：「這個比較安靜。公寓的走廊晚上會有回音。」（沒有宿舍的那一句；AA_426 第 5 節拿掉「理由：」）',evTxt.includes('這個比較安靜。公寓的走廊晚上會有回音。')&&!evTxt.includes('理由：宿舍的走廊晚上會有回音'));
    check('4. 閒聊階梯 A6-L2：「有一點。房東寄來的信，我還看不太懂。」',!!A62&&A62.choices[1].reply==='有一點。房東寄來的信，我還看不太懂。',J(A62&&A62.choices));
    const g9=JP.GRP.find(r=>r[0]==='2028-04-09'), g21=JP.GRP.find(r=>r[0]==='2028-05-21');
    check('4. 挽回中的交換生群組：「公寓的垃圾分六種。」「投幣洗衣機三號壞了。不要投錢。」（退幣口照舊）',g9[1]==='公寓的垃圾分六種。分類表我拍了，在相簿。'&&g21[1]==='投幣洗衣機三號壞了。不要投錢。'&&g21[3].text==='退幣口用力按一下。',J([g9,g21])); });
  /* ---- 5 以安的訊息池照日期 ---- */
  await sec('5',async()=>{
    check('5. 讀稿：「你那邊期中考了嗎？」在稿裡',inMD('「你那邊期中考了嗎？」只在**第 8～9 週**'));
    check('5. 期中那則改「你那邊期中考了嗎？」（不是大二上的行政法）',R2Y3B_EVENTS.AB.t2[0].L[1]==='你那邊期中考了嗎？');
    fresh('2028-03-26',20,'dorm',{EXCHANGE_ROUTE:'TW'}); const R0={};
    const n10=R2Y3B_EVENTS.AB.t1.length, w1=R2Y3B.abPickT1(G,R0,D('2028-03-26'),n10), w3=R2Y3B.abPickT1(G,R0,D('2028-04-09'),n10), w5=R2Y3B.abPickT1(G,R0,D('2028-04-23'),n10), w7=R2Y3B.abPickT1(G,R0,D('2028-05-07'),n10), w9=R2Y3B.abPickT1(G,R0,D('2028-05-21'),n10);
    check('5. 櫻花那則（十則的第 3 則，AA_463 第 1 節）只在 4 月：3/26 到的那週、4/9 飯糰、4/23 櫻花、之後洗衣機、町公所，5 月以後不再出櫻花',w1===0&&w3===1&&w5===2&&w7===3&&w9===4,J([w1,w3,w5,w7,w9]));
    const T=CALENDAR.termDays('Y3S2'), dayW=w=>{ for(let d=T.from;d<=T.to;d++){ const t=CALENDAR.termOf(d); if(t&&t.week===w&&wdOf(d)===0) return d; } return null; };
    const R2={}, p5=R2Y3B.abPick(G,R2,'n2',4,'t2',dayW(5)), p8=R2Y3B.abPick(G,R2,'n2',4,'t2',dayW(8)), p10=R2Y3B.abPick(G,R2,'n2',4,'t2',dayW(10)), p11=R2Y3B.abPick(G,R2,'n2',4,'t2',dayW(11)), p12=R2Y3B.abPick(G,R2,'n2',4,'t2',dayW(12));
    check('5. 期中那則只在臺灣的第 8～9 週；讀書會那則沒參加過不出',p5===1&&p8===0&&p10===3&&p11===1&&p12===3&&[p5,p10,p11,p12].every(i=>i!==0&&i!==2),J([p5,p8,p10,p11,p12]));
    const R3={}, v1=R2Y3B.abPick(G,R3,'n3',3,'t3',D('2028-07-23')), v2=R2Y3B.abPick(G,R3,'n3',3,'t3',D('2028-07-30'));
    check('5. 「這禮拜的課很難。」那段視訊只在 7/21 以前（7/23、7/30 都不是第一段）',v1!==0&&v2!==0&&v1!==v2,J([v1,v2]));
    const R4={}, v3=R2Y3B.abPick(G,R4,'n3',3,'t3',D('2028-06-25'));
    check('5. 對照：7/21 以前照順序出第一段',v3===0);
    fresh('2028-03-26',20.1,'dorm',{EXCHANGE_ROUTE:'TW',AN_JP_DEPARTED:D('2028-03-25')}); R('heroine_01','FAM'); G.contacts.heroine_01=1; R2Y3B.abPhone(G); PHONE.tick(G); const m=txt('p:heroine_01');
    check('5. 實際跑 3/26 的手機規則（臺灣路線、第 1 週）：沒有傳四月的櫻花',m.length>0&&!m.some(t=>/櫻花/.test(t)),J(m)); });
  /* ---- 6 語彤 Y6-L3 杜鵑花（第 6-3 節）---- */
  await sec('6',async()=>{
    const ONE='以安傳在群組那張杜鵑花，是你拍的吧。……拍得很好。', DL=['杜鵑花節那天你們去拍的那張，以安有傳給我。','她每年都站在同一棵樹前面拍一張，今年是第三張。'], ORG=['杜鵑花節那天，以安找我陪她去拍照。','她每年都站在同一棵樹前面拍一張，今年是第三張。'];
    check('6. 讀稿：第 6-3 節的句子',inMD('「'+ONE+'」')&&inMD('「（給她看手機裡的另一張）」')&&inMD('「……這張她眨眼了。」「你沒傳這張，是對的。」'));
    const st=LADDER.byTerm.Y3S2.heroine_03.steps.find(s=>s.id==='Y6-L3');
    const play6=(az,dt)=>{ fresh('2028-03-23',17,'noodle'); R('heroine_03','FAM'); R('heroine_01','FRI'); if(dt) date('heroine_01'); if(az) SOCIAL.remember('heroine_01','AN3_AZALEA',''); return {L:STORY.ladLines(st,G,'heroine_03'),C:STORY.ladChoices(st).map(c=>c.t)}; };
    const a=play6(true,false), b=play6(true,true), c=play6(false,true), d=play6(false,false);
    check('6. 沒和以安交往＋祐廷拍的：只剩一句；選項「為什麼是同一棵？」「（給她看手機裡的另一張）」',J(a.L)===J([ONE])&&J(a.C)===J(['「為什麼是同一棵？」','（給她看手機裡的另一張）']),J(a));
    check('6. 交往中＋祐廷拍的：交往中那一套（「你們去拍的那張」）；選項同上',J(b.L)===J(DL)&&J(b.C)===J(['「為什麼是同一棵？」','（給她看手機裡的另一張）']),J(b));
    check('6. 交往中、沒有祐廷拍的：原本那一套（語彤陪以安去），選項照舊',J(c.L)===J(ORG)&&J(c.C)===J(['「為什麼是同一棵？」','「妳也有拍嗎？」']),J(c));
    check('6. 都沒有：照原本',J(d.L)===J(ORG)&&J(d.C)===J(['「為什麼是同一棵？」','「妳也有拍嗎？」']),J(d));
    fresh('2028-03-23',17,'noodle'); R('heroine_03','FAM'); SOCIAL.remember('heroine_01','AN3_AZALEA',''); said=[]; picks=['給她看手機']; await STORY.ladPlay(GM,{name:'陳語彤'},'heroine_03',st);
    check('6. 選「（給她看手機裡的另一張）」：語彤兩句「……這張她眨眼了。」「你沒傳這張，是對的。」',all().slice(-2).join('|')==='……這張她眨眼了。|你沒傳這張，是對的。',J(all())); });
  /* ---- 9 民訴第 14 週（第 6-1 節）---- */
  await sec('9',async()=>{
    check('9. 讀稿：第 6-1 節的句子',['「言詞辯論的順序：原告、被告」','「先講要什麼，再講為什麼」','「一個人一分鐘」','「左邊這半當原告，右邊這半當被告。一個人一分鐘，先講你要什麼。」','「沒有法官喔？……那我當原告。我要先講。」','「我計時。一分鐘，我幫大家按碼表。」','「蔡教授讓大家分成兩邊。你在……」','「上週的練習：講義在課程網」'].every(inMD));
    const W=SYLLABUS.courses.civpro_2, w14=W.find(w=>w.w===14), w15=W.find(w=>w.w===15);
    check('9. 第 14 週：板書三行、教授那句、兩個人的反應、選邊（原告、被告兩個，結果照原句）',J(w14.board)===J(['言詞辯論的順序：原告、被告','先講要什麼，再講為什麼','一個人一分鐘'])&&w14.line==='左邊這半當原告，右邊這半當被告。一個人一分鐘，先講你要什麼。'
      &&J(w14.react)===J([{who:'yu',text:'沒有法官喔？……那我當原告。我要先講。'},{who:'classmate_bohan',text:'我計時。一分鐘，我幫大家按碼表。'}])&&w14.obs.prompt==='蔡教授讓大家分成兩邊。你在……'&&J(w14.obs.options.map(o=>[o.text,o.result]))===J([['原告','你發現說清楚「我要什麼」比想像中難。'],['被告','你發現被告的第一句話，最重要。']]),J(w14));
    check('9. 第 14、15 週沒有「模擬法庭」、第 14 週沒有法官的角色、第 15 週板書第 2 行「上週的練習：講義在課程網」',!/模擬法庭/.test(J([w14,w15]))&&!/當法官|法官寫|選項.*法官/.test(J(w14))&&!w14.obs.options.some(o=>o.text==='法官')&&w15.board[1]==='上週的練習：講義在課程網',J(w15.board)); });
  /* ---- 7 挽回中 ---- */
  await sec('7',async()=>{
    check('7. 讀稿：兩句旁白在稿裡',inMD('（以安點了一下頭，沒有說話。）')&&inMD('（以安看了你一眼，又低頭寫。）'));
    fresh('2028-03-01',12,'campus'); R('heroine_01','FRI'); ex('heroine_01'); const s1=['A6-L1','A6-L2','A6-L3','A6-L4'].map(id=>!!STORY.LADDER_SKIP[id]&&STORY.LADDER_SKIP[id](G));
    fresh('2028-03-01',12,'campus'); R('heroine_01','FRI'); const s2=['A6-L1','A6-L2','A6-L3','A6-L4'].map(id=>!!STORY.LADDER_SKIP[id]&&STORY.LADDER_SKIP[id](G));
    fresh('2028-03-01',12,'campus'); R('heroine_01','FRI'); date('heroine_01'); const s3=['A6-L1','A6-L2','A6-L3','A6-L4'].map(id=>!!STORY.LADDER_SKIP[id]&&STORY.LADDER_SKIP[id](G));
    check('7. A6 整層：和以安分手、挽回中略過；沒交往過、交往中照聽',s1.every(x=>x)&&s2.every(x=>!x)&&s3.every(x=>!x),J({s1,s2,s3}));
    fresh('2028-03-24',19,'noodle',{EXCHANGE_ROUTE:'JP'}); ['zhe','heroine_01'].forEach(id=>R(id,'FRI')); ex('heroine_01'); let L=await play('ev_an_farewell_dinner',[0]);
    check('7. 餞行（日本路線、挽回中）選「到了我幫妳顧行李。」：旁白「（以安點了一下頭，沒有說話。）」，沒有「……你顧你自己的。」',L.includes('（以安點了一下頭，沒有說話。）')&&!L.includes('……你顧你自己的。'),J(L));
    fresh('2028-03-24',19,'noodle',{EXCHANGE_ROUTE:'JP'}); ['zhe','heroine_01'].forEach(id=>R(id,'FRI')); date('heroine_01'); L=await play('ev_an_farewell_dinner',[0]);
    check('7. 對照：交往中照舊「……你顧你自己的。」',L.includes('……你顧你自己的。')&&!L.includes('（以安點了一下頭，沒有說話。）'),J(L));
    fresh('2028-02-28',13,'riverside'); ['yu','zhe','heroine_01'].forEach(id=>R(id,'FRI')); ex('heroine_01'); L=await play('ev_y3s2_228',['坐到以安旁邊']);
    check('7. 228（挽回中）坐到以安旁邊：旁白「（以安看了你一眼，又低頭寫。）」，她不接話、不轉手帳',L.includes('（以安看了你一眼，又低頭寫。）')&&!L.includes('……你也要算嗎？')&&!L.some(t=>/手帳轉過來/.test(t)),J(L));
    fresh('2028-02-28',13,'riverside'); ['yu','zhe','heroine_01'].forEach(id=>R(id,'FRI')); L=await play('ev_y3s2_228',['坐到以安旁邊']);
    check('7. 對照：沒有分手照舊「……你也要算嗎？」',L.includes('……你也要算嗎？')&&!L.includes('（以安看了你一眼，又低頭寫。）'),J(L)); });
  /* ---- 8 芷若大三下的班 ---- */
  await sec('8',async()=>{
    check('8. 讀稿：作息、兩句邀約在稿裡',inMD('**週三、四 19:00～22:00**')&&inMD('「這禮拜四我十點下班。……」')&&inMD('「考完了嗎？禮拜四我下班以後，吃個東西？」'));
    const ZR=CHARACTERS.heroine_02, at=(key,h)=>{ fresh(key,h,'campus'); const e=STORY.schedEnt(ZR,G); return e&&e.act==='barista'; };
    const r={mon20:at('2028-03-06',20),tue20:at('2028-03-07',20),wed20:at('2028-03-08',20),thu21:at('2028-03-09',21.5),fri20:at('2028-03-10',20),mon12:at('2028-03-06',12),wed12:at('2028-03-08',12),jun22thu:at('2028-06-22',20),jun19mon:at('2028-06-19',20),y2mon:at('2026-10-05',20)};
    check('8. 大三下（到 6 月底）只有週三、四 19:00～22:00 在吧檯；一、二、五晚上、中午不在；大二上照舊',!r.mon20&&!r.tue20&&r.wed20&&r.thu21&&!r.fri20&&!r.mon12&&!r.wed12&&r.jun22thu&&!r.jun19mon&&r.y2mon,J(r));
    const ws=LADDER.byTerm.Y3S2.heroine_02.workShifts, en=ZR.daily_schedule.find(e=>e.act==='barista'&&e.dates&&e.dates[0][0]==='2028-02-21');
    check('8. 作息那一筆和閒聊階梯 Y3S2 的 workShifts 一樣（週三、四 19～22）',!!en&&ws.length===1&&J(en.days)===J(ws[0].weekday)&&en.from===ws[0].time[0]&&en.to===ws[0].time[1],J({ws,en:en&&[en.days,en.from,en.to]}));
    const rs=x=>typeof x==='function'?x(G):x, h=TERMEND.heart('heroine_02','Y3S2'), f=TERMEND.friend('heroine_02','Y3S2');   /* 大三下的心意邀約被 r2y3b3d.js 包了一層（Z13 那一版），一般版照台詞表 */
    check('8. 期末心意：「這禮拜四我十點下班。……你要不要等我？……」週四 22:00；第二次「禮拜四十點。」',rs(h.invite)==='這禮拜四我十點下班。……你要不要等我？我想吃飯，不想吃店裡的東西。'&&rs(h.invite2)==='禮拜四十點。……上次那句，你想好了嗎？'&&h.wd===4&&h.h===22,J({i:rs(h.invite),i2:rs(h.invite2),wd:h.wd,h:h.h}));
    check('8. 期末朋友邀約：「考完了嗎？禮拜四我下班以後，吃個東西？」週四 22:00',f.genByTerm.Y3S2==='考完了嗎？禮拜四我下班以後，吃個東西？'&&f.wd===4&&f.hByTerm.Y3S2===22,J({g:f.genByTerm.Y3S2,wd:f.wd,h:f.hByTerm.Y3S2}));
    const h1=TERMEND.heart('heroine_02','Y2S1'), f1=TERMEND.friend('heroine_02','Y2S1');
    check('8. 對照：大二上照舊（週五、十點）',h1.wd===5&&/禮拜五/.test(rs(h1.invite))&&f1.wd===5); });
  /* ---- 10、11 期末 ---- */
  await sec('10',async()=>{
    check('10、11. 讀稿',inMD('「欸 你考完了吧 宵夜」')&&inMD('「你考完了吧 宵夜 我想吃兩份」')&&inMD('「……六月的週五，你先全部給我。」')&&inMD('「我七月先回台中，去影印店幫忙一個月。」'));
    const w0=TERMEND.window; let a,b,c,d;
    try{ TERMEND.window=()=>({id:'Y3S2'}); a=[].concat(TERMEND_LINES.HEART.heroine_04.invite(G)); b=TERMEND_LINES.GF.heroine_04.invite(G);
      TERMEND.window=()=>({id:'Y2S2'}); c=[].concat(TERMEND_LINES.HEART.heroine_04.invite(G)); d=TERMEND_LINES.GF.heroine_04.invite(G); } finally { TERMEND.window=w0; }
    check('10. 子晴大三下（她 6/3 畢業了）：心意「欸 你考完了吧 宵夜」、交往中「你考完了吧 宵夜 我想吃兩份」；大二下照舊',a[0]==='欸 你考完了吧 宵夜'&&a[1]==='只有我們兩個 不要找阿凱'&&b==='你考完了吧 宵夜 我想吃兩份'&&c[0]==='欸 考完了 宵夜'&&d==='考完了 宵夜 我想吃兩份',J({a,b,c,d}));
    check('11. 芷若交往中的飯桌（大三下）：「……六月的週五，你先全部給我。」',TERMEND_LINES.GF.heroine_02.tableByTerm.Y3S2[1]==='……六月的週五，你先全部給我。');
    check('11. 芷若 Z12：「我七月先回台中，去影印店幫忙一個月。」',ev('ev_zhiruo_graduation_cafe').dialogue[0].text==='我七月先回台中，去影印店幫忙一個月。'); });
  /* ---- 12、13、14 ---- */
  await sec('12',async()=>{
    check('12～14. 讀稿',inMD('「比較行政法的報告，我排在第六週。」')&&inMD('「報告講完了。……好累。」')&&inMD('「你那邊的課跟得上嗎？跟不上的話，筆記拍給我，我幫你對。」'));
    check('12. 挽回中的群組 5/14：「比較行政法的報告，我排在第六週。」',JP.GRP.find(r=>r[0]==='2028-05-14')[1]==='比較行政法的報告，我排在第六週。要換的人跟我說。');
    fresh('2028-05-03',18.2,'jp_hub',{EXCHANGE_ROUTE:'JP',JP_DEPARTED:D('2028-03-25')}); date('kexin'); G.contacts.kexin=1; Y34B.kx19Phone(G); PHONE.tick(G); const m=txt('p:kexin');
    check('13. 日本路線 5/3（沒收到「坐最後一排」的邀約）：「報告講完了。……好累。」，不說最後一排',m.includes('報告講完了。……好累。')&&!m.some(t=>/最後一排/.test(t)),J(m));
    fresh('2028-05-03',17.2,'dorm',{EXCHANGE_ROUTE:'TW'}); date('kexin'); G.contacts.kexin=1; Y34B.kx19Phone(G); PHONE.tick(G); const n=txt('p:kexin');
    check('13. 對照：臺灣路線照舊「期末報告講完了。最後一排空著。」',n.includes('期末報告講完了。最後一排空著。'),J(n));
    fresh('2028-04-13',20.5,'jp_hub',{EXCHANGE_ROUTE:'JP',JP_DEPARTED:D('2028-03-25')}); PHONE.join(G,'noodle_team','麵店團'); ['zhe','classmate_bohan'].forEach(id=>R(id,'FRI')); const L=await play('ev_far_call_jp');
    check('14. 日本路線 4/13 視訊：柏翰「你那邊的課跟得上嗎？跟不上的話，筆記拍給我，我幫你對。」',L.includes('你那邊的課跟得上嗎？跟不上的話，筆記拍給我，我幫你對。')&&!L.includes('這週的筆記我留了。回來再給你。'),J(L)); });
  /* ---- 15、16 語彤的階梯 ---- */
  await sec('15',async()=>{
    check('15、16. 讀稿',inMD('「週四我還是五點就到店門口。……只是現在不是去顧店。」')&&inMD('「巷子裡有個修鞋的老闆，我又去找他聊了一次。」'));
    const st=id=>LADDER.byTerm.Y3S2.heroine_03.steps.find(s=>s.id===id);
    fresh('2028-03-09',18,'campus',{YT_T1:true}); const a=STORY.ladLines(st('Y6-L1'),G,'heroine_03'); fresh('2028-03-09',18,'campus'); const b=STORY.ladLines(st('Y6-L1'),G,'heroine_03');
    check('15. Y6-L1：一起做過田野（YT_T1）＝「週四我還是五點就到店門口。……只是現在不是去顧店。」；沒有的照原句',J(a)===J(['週四我還是五點就到店門口。……只是現在不是去顧店。'])&&b[0]==='週四晚上空下來，我五點半還是會想往店裡走。',J({a,b}));
    fresh('2028-04-06',18,'campus'); const c=STORY.ladLines(st('Y6-L4'),G,'heroine_03'); fresh('2028-04-06',18,'campus',{FIELD_FINDING:true}); const d=STORY.ladLines(st('Y6-L4'),G,'heroine_03');
    check('16. Y6-L4：沒有田野的發現＝「巷子裡有個修鞋的老闆，我又去找他聊了一次。」（第二句照舊）；有的照原句',c[0]==='巷子裡有個修鞋的老闆，我又去找他聊了一次。'&&c[1]==='他記得每一雙送來修的鞋，客人的臉反而記不住。'&&d[0]==='修鞋店那個老闆，我又去找他聊了一次。',J({c,d})); });
  /* ---- 17、18、19 ---- */
  await sec('17',async()=>{
    check('17～19. 讀稿',inMD('（住了三天，房間還是覺得小。）')&&inMD('「（宿舍的床墊翻起來的時候，下面有一張不知道誰的課表。）」')&&inMD('時間改**日本 22:00**'));
    check('17. 3/28 摘要：「（住了三天，房間還是覺得小。……）」（3/25 抵達就入住）',JP.SCH.find(x=>x.k==='g1_s').sum.indexOf('（住了三天，房間還是覺得小。')===0);
    const src=['src/r2y3a3d.js','src/r2y3b3d.js','src/data/r2y3b_events.js'].map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n');
    check('18. 退宿的床墊（日本路線 2/20、美國路線 X1 兩處）：「下面有一張不知道誰的課表。」，沒有「大一的課表」',(src.match(/下面有一張不知道誰的課表。/g)||[]).length===3&&!/下面有一張大一的課表/.test(src));
    fresh('2028-04-13',20,'dorm',{EXCHANGE_ROUTE:'TW'}); date('heroine_01'); R2Y3B.farVideoPhone(G); const q=OUT.get(G,'y3_an_far_video');
    check('19. 臺灣、美國路線和以安交往中 4/13：視訊在臺灣 21:00（日本 22:00）',!!q&&q.h===21&&/日本 22:00/.test(q.title),J(q&&{h:q.h,t:q.title}));
    fresh('2028-04-13',21.2,'dorm',{EXCHANGE_ROUTE:'TW'}); date('heroine_01'); R2Y3B.farVideoPhone(G); check('19. 21:00 以後才跑到：不排',!OUT.get(G,'y3_an_far_video')); });
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
