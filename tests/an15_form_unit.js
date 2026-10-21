// 1A-05　大三交換志願表＝以安新 15「為什麼是日本」（AA_315；台詞照 AA_315 第 2 節）——不需要瀏覽器。照 AA_315 第 7 節給 BB 的驗收情境 F1～F9 寫：
//   1. 11/15 09:00 學校信箱（所有人）；11/16 21:00 以安私訊（一般／交往中兩種；不認識、不到 FAMILIAR、分手了＝沒有）；
//   2. F1 和以安交往、15:30 到 Café：A 版逐字、「還沒」→「……下禮拜。不准賴。」、AN15_SEEN、IMPORTANT_CONVERSATION；11/18 旁白「今天第二張寫這間的」；
//   3. F2 和學姊交往、以安不知道：B 版「美國。好遠。」；知道＝「美國。……學姊也去那裡吧。」；學姊 20:00 訊息、21:30 在法圖當面「我知道你會填那裡」；
//   4. F3 和學姊交往、沒去法圖：22:30 四句變訊息、選項一樣；
//   5. F4 單身、認識以安、到 Café：C 版「你不填？」；11/18 旁白「放在書包裡一個禮拜」；學姊非交往版「每天傳一張照片給你」（雙方單身）／JP「……你們要回。」；
//   6. F5 和可昕交往：見面的最後（outings3d.js）或 11/17 22:00 電話；「我在想要不要交換」→「你問我意見，還是告訴我結果？」；「問妳」記 KX_EXCHANGE_ASKED；
//   7. F6 不認識以安：沒有私訊、沒有 Café；F7 沒去 Café：16:00「我在窗邊。」、18:00「我先交了」、沒有 AN15_SEEN、A5-L5 沒有「妳那天講的，我聽過了」；
//   8. F8 感冒週以安在場：多一句「你上個月感冒的時候說……」（阿哲在場＝阿哲那句）；知道經濟系那一年＝「你換過一次方向。」；說明會＝2-0；
//   9. F9 沒有「台灣沒有行政指導」；11/18 旁白：沒演 Café 的 JP／US 多一句；接線（S.tick、phoneRules、sleepNow 11/17 22:00）。
// 修改前全部 FAIL。用法：node tests/an15_form_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|WANCAI_LAYOUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/wancai_layout.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null, toasts=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(t){ toasts.push(t); },updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k);
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; toasts=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; ADV.active=false; return G; };
const LV={FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv]; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const date=id=>{ G.flags['dating_'+id]=true; const r=ROM.get(G,id); r.status='dating'; SOCIAL.remember(id,'FIRST_MET',''); };
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const TH=(th)=>(G.msgs||[]).filter(m=>m.th===th);
const txt=(th)=>TH(th).map(m=>m.text);
const d15=D('2027-11-15'), d16=D('2027-11-16'), d17=D('2027-11-17'), d18=D('2027-11-18');
const runPhone=(day,h0,h1)=>{ G.day=day; for(let h=h0;h<=h1+1e-9;h+=0.05){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const cafe=async(p)=>{ G.day=d17; G.hour=15.5; G.zone='cafe'; said=[]; opts=[]; picks=p||[]; return STORY.an15Cafe(GM); };
(async()=>{
  // 1. 信箱、私訊
  fresh(d15,8,'dorm'); runPhone(d15,8.9,9.1); check('1. 11/15 09:00 學校信箱（系統字）', txt('sys').includes('交換學生申請：11/18（四）中午截止。'), JSON.stringify(txt('sys')));
  fresh(d16,20,'dorm'); R('heroine_01','FAM'); runPhone(d16,20.9,21.1); check('1. 11/16 21:00 以安私訊（一般）', JSON.stringify(txt('p:heroine_01'))===JSON.stringify(['明天下午三點半，兩點半 Café。交換的志願表，後天截止。']), JSON.stringify(txt('p:heroine_01')));
  fresh(d16,20,'dorm'); date('heroine_01'); runPhone(d16,20.9,21.1); check('1. 11/16 21:00 以安私訊（交往中）', JSON.stringify(txt('p:heroine_01'))===JSON.stringify(['明天下午三點半，兩點半 Café。我們一起填。']));
  fresh(d16,20,'dorm'); R('heroine_01','FAM'); G.flags.romance=G.flags.romance||{}; ROM.get(G,'heroine_01').status='ex'; runPhone(d16,20.9,21.1); check('1. 和以安分手了（ex）：沒有私訊', txt('p:heroine_01').length===0);
  // 7. F6
  fresh(d16,20,'dorm'); runPhone(d16,20.9,21.1); check('7. F6 不認識以安：沒有私訊', txt('p:heroine_01').length===0);
  G.day=d17; G.hour=15.5; G.zone='cafe'; check('7. F6 不認識以安：Café 不演', STORY.an15Due(G)===false);
  // 2. F1
  fresh(d16,21.2,'dorm'); date('heroine_01'); runPhone(d16,21.2,21.3); check('2. F1 到期：11/17 15:30 在 Café（15:15～）', (()=>{ G.day=d17; G.hour=15.3; G.zone='cafe'; return STORY.an15Due(G); })()&&!(()=>{ G.hour=15.1; return STORY.an15Due(G); })());
  await cafe(['還沒']); const L1=lines();
  check('2. F1 共通的開頭逐字（2-1）、交往中＝「你的呢？」', L1[0]==='沈以安：（把自己的志願表推過來。第一志願「日本」，字很工整。申請理由那一欄寫得很滿。）'&&L1[1]==='沈以安：我的。'&&L1[2]==='（申請理由第一行寫著：「行政指導：沒有命令，對方照做。是信任，還是壓力？」）'&&L1[3]==='沈以安：台灣也有這一條。可是條文只寫了怎麼規定，我想看的是那邊的人為什麼照做。'&&L1[4]==='沈以安：那個要去那裡看。'&&L1[5]==='沈以安：你的呢？', JSON.stringify(L1.slice(0,6)));
  check('2. F1 A 版逐字：旁白、「寫好了？」「我們同一所……」「下禮拜要補語言成績……」、選「還沒」→「……下禮拜。不准賴。」、結尾', L1.includes('（志願表第一欄，你寫了日本那所大學的名字。和她填的是同一所。附件欄夾了一張語言成績單。）')&&L1.includes('沈以安：寫好了？')&&L1.includes('沈以安：我們同一所。我查過了，宿舍在同一區。')&&L1.includes('沈以安：下禮拜要補語言成績，你的考了嗎？')&&opts[0].join('|')==='「考了。」|「還沒。」'&&L1.includes('沈以安：……下禮拜。不准賴。')&&L1[L1.length-1]==='（窗外的溫州街開始暗了。以安把她那一張收進資料夾，對齊了兩次。）', JSON.stringify(L1.slice(6)));
  check('2. F1 旗標：AN15_SEEN、AN15_ANSWER not_yet、IMPORTANT_CONVERSATION（為什麼是日本）', G.flags.AN15_SEEN===d17&&G.flags.AN15_ANSWER==='not_yet'&&SOCIAL.has('heroine_01','IMPORTANT_CONVERSATION')&&!!G.events.done.ev_an_why_japan);
  check('9. F9 沒有「台灣沒有行政指導」「在台灣讀不到」、沒有推薦選項', !said.some(s=>/讀不到|台灣沒有/.test(s.t))&&!opts.some(o=>o.some(t=>/推薦|建議/.test(t))));
  G.day=d18; G.hour=8; G.zone='dorm'; check('2. F1 11/18 起床：截止旁白到期（12:00 以前照預覽）', STORY.routeNarrDue(G)); said=[]; await STORY.routeNarr(GM);
  check('2. F1 11/18 旁白（有演 Café 的 JP）「（你把表交到系辦。助理蓋了章，說：『今天第二張寫這間的。』）」', JSON.stringify(said.map(s=>s.t))===JSON.stringify(['（你把表交到系辦。助理蓋了章，說：『今天第二張寫這間的。』）'])&&!STORY.routeNarrDue(G), JSON.stringify(said.map(s=>s.t)));
  G.hour=12; STORY.routeDecide(G); check('2. F1 12:00 路線＝JP（routeDecide；這一場不決定）', G.flags.EXCHANGE_ROUTE==='JP');
  // 3. F2
  fresh(d16,21.2,'dorm'); R('heroine_01','FAM'); date('heroine_05'); runPhone(d16,21.2,21.3); await cafe(); const L2=lines();
  check('3. F2 B 版：以安不知道＝「美國。好遠。」「那理由欄寫你自己的就好。」、沒有選項', L2.includes('（志願表第一欄，你寫了美國那所大學的名字。大四上，和她同一個學期。附件欄夾了一張語言成績單。）')&&L2.includes('沈以安：美國。好遠。')&&L2.includes('沈以安：那理由欄寫你自己的就好。')&&opts.length===0, JSON.stringify(L2));
  ROM.learn(G,'heroine_01','heroine_05','rumor'); G.flags.AN15_SEEN=null; await cafe(); check('3. F2 以安知道＝「美國。……學姊也去那裡吧。」', lines().includes('沈以安：美國。……學姊也去那裡吧。'));
  runPhone(d17,19.9,20.1); check('3. F2 20:00 學姊「我在法圖。九點四十五關門。」', txt('p:heroine_05').includes('我在法圖。九點四十五關門。'));
  G.day=d17; G.hour=21.5; G.zone='lawlib'; check('3. F2 21:30 在法圖：當面版到期', STORY.sisFormFaceDue(G,E)); said=[]; opts=[]; picks=['一半一半']; await STORY.sisFormFace(GM); const L3=lines();
  check('3. F2 當面版逐字（交往中）：「志願表交了？」祐廷「交了。美國。」「……我知道你會填那裡。」「可是你要自己也想去……」→「一半一半。」→「……誠實。好。」', JSON.stringify(L3)===JSON.stringify(['溫書瑀：志願表交了？','祐廷：交了。美國。','溫書瑀：……我知道你會填那裡。','溫書瑀：可是你要自己也想去。不是只因為我在那邊。','溫書瑀：……誠實。好。'])&&opts[0].join('|')==='「我自己也想去。」|「一半一半。」'&&G.flags.SIS_FORM_REACT==='face', JSON.stringify(L3));
  runPhone(d17,22.4,22.6); check('3. 當面演過：22:30 不再傳手機版', !txt('p:heroine_05').includes('志願表交了？'));
  G.day=d17; G.hour=21.5; G.zone='wancai'; G.flags.SIS_FORM_REACT=null; const LD=WANCAI_LAYOUT.lawlibDoor.it; E.player.obj.position.x=LD.x+1; E.player.obj.position.z=LD.z; check('3. 在萬才館的法圖門口也算', STORY.sisFormFaceDue(G,E)); E.player.obj.position.x=LD.x+30; check('3. 萬才館大廳別的地方不算', !STORY.sisFormFaceDue(G,E)); E.player.obj.position.x=0;
  // 4. F3
  fresh(d17,19,'dorm'); date('heroine_05'); runPhone(d17,19,22.6); const m=TH('p:heroine_05');
  check('4. F3 沒去法圖：22:30「志願表交了？」、回「交了。美國。」以後兩句、再選（選項一樣）', m.some(x=>x.text==='志願表交了？'&&x.ask&&x.ask.opts.length===1&&x.ask.opts[0].t==='交了。美國。')&&G.flags.SIS_FORM_REACT==='phone', JSON.stringify(m.map(x=>x.text)));
  { const q=m.find(x=>x.text==='志願表交了？'); const r=PHONE.answer(G,q.ask.id,0); const m2=TH('p:heroine_05'); const q2=m2.find(x=>x.text==='可是你要自己也想去。不是只因為我在那邊。');
    check('4. F3 回了：「……我知道你會填那裡。」「可是你要自己也想去……」＋選項「我自己也想去。」「一半一半。」', !!r&&m2.some(x=>x.text==='……我知道你會填那裡。')&&!!q2&&q2.ask&&q2.ask.opts.map(o=>o.t).join('|')==='我自己也想去。|一半一半。', JSON.stringify(m2.map(x=>x.text)));
    const r2=q2?PHONE.answer(G,q2.ask.id,0):null; check('4. F3 選「我自己也想去。」→「好。那我相信你。」', !!r2&&TH('p:heroine_05').some(x=>x.text==='好。那我相信你。')); }
  // 5. F4
  fresh(d16,21.2,'dorm'); R('heroine_01','FAM'); R('heroine_05','FRI'); runPhone(d16,21.2,21.3); await cafe(['還在想']); const L5=lines();
  check('5. F4 C 版：「（志願表你拿了一張。到現在還是空白的。）」「你不填？」→「還在想。」→「明天中午截止喔。……想好了就好。」；一般「你的呢？……你還沒填。」', L5.includes('（志願表你拿了一張。到現在還是空白的。）')&&L5.includes('沈以安：你不填？')&&L5.includes('沈以安：明天中午截止喔。……想好了就好。')&&L5.includes('沈以安：你的呢？……你還沒填。很少見。你平常都很快。')&&G.flags.AN15_ANSWER==='thinking'&&opts[0].join('|')==='「嗯。臺灣的大四也還沒過完。」|「還在想。」', JSON.stringify(L5));
  G.day=d17; G.hour=21.2; G.zone='lawlib'; said=[]; await STORY.sisFormFace(GM); check('5. F4 學姊非交往版（雙方單身）：「志願表填了？」祐廷「沒填。留在臺灣。」「好。那我明年在美國，每天傳一張照片給你。」', JSON.stringify(lines())===JSON.stringify(['溫書瑀：志願表填了？','祐廷：沒填。留在臺灣。','溫書瑀：好。那我明年在美國，每天傳一張照片給你。']), JSON.stringify(lines()));
  G.day=d18; G.hour=9; G.zone='dorm'; said=[]; await STORY.routeNarr(GM); check('5. F4 11/18 旁白（TW）逐字', JSON.stringify(said.map(s=>s.t))===JSON.stringify(['（志願表你拿了一張，放在書包裡一個禮拜。最後沒有交。）','（你想，臺灣的大四也還沒過完。）']));
  fresh(d17,21.2,'lawlib'); date('heroine_01'); R('heroine_05','FRI'); said=[]; await STORY.sisFormFace(GM); check('5. 學姊非交往版、JP：「日本。」「……你們要回。」', JSON.stringify(lines())===JSON.stringify(['溫書瑀：志願表填了？','祐廷：日本。','溫書瑀：好。那我明年在美國，每天在家族群組放一張照片。……你們要回。']), JSON.stringify(lines()));
  fresh(d17,19,'dorm'); R('heroine_05','FRI'); runPhone(d17,19,22.6); { const q=TH('p:heroine_05').find(x=>x.ask); check('5. 學姊非交往、沒去法圖：22:30「Kevin 說交換志願明天截止。你填了嗎？」、選項「沒填，留在臺灣。」', !!q&&q.text==='Kevin 說交換志願明天截止。你填了嗎？'&&q.ask.opts.map(o=>o.t).join('|')==='沒填，留在臺灣。'&&q.ask.opts[0].say[0].text==='好。那我明年在美國，每天傳一張照片給你。', q&&JSON.stringify(q.ask.opts)); }
  fresh(d17,19,'dorm'); R('heroine_05','FAM'); runPhone(d17,19,22.6); check('5. 學姊不到 FRIEND、也不是交往中：沒有這一段', txt('p:heroine_05').length===0&&G.flags.SIS_FORM_REACT==null);
  // 6. F5
  fresh(d16,12,'campus'); date('kexin'); check('6. F5 11/15～11/17 和可昕交往：見面的最後要說', STORY.kxExchTalkDue(G)); said=[]; opts=[]; picks=[0,0]; await STORY.kxExchTalk(GM,'face'); const L6=lines();
  check('6. F5「我在想要不要交換。」→「你問我意見，還是告訴我結果？」「……兩種都可以……」→「問妳。」→「那我的意見是：想去就去。……不用替我想。」→ 旁白（TW）', opts[0].join('|')==='「我在想要不要交換。」|「交換的表，我已經想好了。」'&&JSON.stringify(L6)===JSON.stringify(['杜可昕：你問我意見，還是告訴我結果？','杜可昕：……兩種都可以，我只是想知道是哪一種。','杜可昕：那我的意見是：想去就去。……不用替我想。','（你最後沒有交。）'])&&G.flags.KX_EXCHANGE_ASKED===true&&!STORY.kxExchTalkDue(G), JSON.stringify(L6));
  check('6. F5 沒有假設題（「如果」）、沒有比較', !said.some(s=>/如果|比起/.test(s.t)));
  fresh(d17,22,'dorm'); date('kexin'); date('heroine_01'); check('6. 這三天沒見面：11/17 22:00 電話', STORY.kxExchCallDue(G)); said=[]; picks=[1]; await STORY.kxExchTalk(GM,'call');
  check('6. 電話版：「交換的表，我已經想好了。」→ 祐廷「日本。」→「好。那我們來排時差。」', JSON.stringify(lines())===JSON.stringify(['祐廷：日本。','可昕（電話）：好。那我們來排時差。']), JSON.stringify(lines()));
  fresh(d17,19,'dorm'); date('kexin'); check('6. 11/17 19:00 睡著：22:00 醒來接電話', STORY.lawWakeAt(G)===22);
  fresh(d16,12,'campus'); date('kexin'); picks=[0,1]; said=[]; await STORY.kxExchTalk(GM,'face'); check('6. 「告訴妳結果。」＝第 2 項的回答（TW「留下來？……」）', lines().includes('杜可昕：留下來？……好。那我們的日子不用排時差。'));
  { const o=fs.readFileSync(path.join(ROOT,'src/outings3d.js'),'utf8'); check('6. outings3d.js：可昕在場的出遊、和可昕的約會，演完接這一段（約會的最後）', (o.match(/STORY\.kxExchTalkDue\(G\)\) await STORY\.kxExchTalk\(GM,'face'\)/g)||[]).length===2); }
  // 7. F7
  fresh(d16,21.2,'dorm'); R('heroine_01','FAM'); runPhone(d16,21.2,21.3); runPhone(d17,15,18.2);
  check('7. F7 沒去：16:00「我在窗邊。」、18:00「我先交了。你的，明天中午以前要交。」、沒有 AN15_SEEN', txt('p:heroine_01').includes('我在窗邊。')&&txt('p:heroine_01').includes('我先交了。你的，明天中午以前要交。')&&G.flags.AN15_SEEN==null, JSON.stringify(txt('p:heroine_01')));
  G.day=d17; G.hour=17.2; G.zone='cafe'; check('7. F7 17:00 以後進 Café：不演（她不替他等到最後）', !STORY.an15Due(G));
  { const st=(((LADDER.byTerm||{}).Y3S1||{}).heroine_01||{steps:[]}).steps.find(x=>x.id==='A5-L5'); const c0=st?STORY.ladChoices(st).map(c=>c.t):[]; G.flags.AN15_SEEN=d17; const c1=st?STORY.ladChoices(st).map(c=>c.t):[];
    check('7. F7 階梯 A5-L5：沒有 AN15_SEEN＝沒有「妳那天講的，我聽過了。」；有＝有', !!st&&!c0.includes('「妳那天講的，我聽過了。」')&&c1.includes('「妳那天講的，我聽過了。」'), JSON.stringify([c0,c1])); }
  fresh(d16,21.2,'dorm'); date('heroine_01'); runPhone(d16,21.2,21.3); runPhone(d17,17.9,18.1); check('7. 交往中沒到：18:00「我先交了。你的，明天中午以前。……同一所，不要寫錯。」', txt('p:heroine_01').includes('我先交了。你的，明天中午以前。……同一所，不要寫錯。'));
  G.day=d18; G.hour=13; STORY.routeDecide(G); said=[]; await STORY.routeNarr(GM); check('9. 11/18 旁白：沒演 Café 的 JP 先多一句', JSON.stringify(said.map(s=>s.t))===JSON.stringify(['（志願表第一欄，你寫了日本那所大學的名字。和她填的是同一所。附件欄夾了一張語言成績單。）','（你把表交到系辦。助理蓋了章，說：『今天第二張寫這間的。』）']), JSON.stringify(said.map(s=>s.t)));
  fresh(d18,9,'dorm'); date('heroine_05'); said=[]; await STORY.routeNarr(GM); check('9. 11/18 旁白：沒演 Café 的 US 先多一句、再「助理蓋了章，沒有抬頭。」', JSON.stringify(said.map(s=>s.t))===JSON.stringify(['（志願表第一欄，你寫了美國那所大學的名字。大四上，和她同一個學期。附件欄夾了一張語言成績單。）','（你把表交到系辦。助理蓋了章，沒有抬頭。）']));
  fresh(d18,9,'dorm',{EXCHANGE_ROUTE:'US',EXCH_APPLIED_DAY:d18-30}); check('9. 舊選單選過、沒有 EXCH_RULE 的舊存檔：不播', !STORY.routeNarrDue(G));
  // 8. F8
  fresh(d16,21.2,'dorm',{COLD_WEEK_PRESENT:['heroine_01','zhe'],EXPO_COUNTRY:'日本'}); R('heroine_01','FAM'); SOCIAL.remember('heroine_01','KNOWS_ECON_YEAR',''); runPhone(d16,21.2,21.3); await cafe([0]); const L8=lines();
  check('8. F8 說明會（2-0）、感冒週以安在場的回聲、經濟系那一年', L8[0]==='（說明會那天，你坐在日本那一區。）'&&L8.includes('沈以安：你上個月感冒的時候說，你想用法律做什麼。')&&!L8.includes('沈以安：阿哲說你那週講了一句很帥的話。他不告訴我是什麼。')&&L8.includes('沈以安：你換過一次方向。這次也是你自己選。'), JSON.stringify(L8.slice(0,9)));
  fresh(d16,21.2,'dorm',{COLD_WEEK_PRESENT:['zhe']}); R('heroine_01','FAM'); runPhone(d16,21.2,21.3); await cafe([0]); check('8. 阿哲在場、以安不在：「阿哲說你那週講了一句很帥的話。他不告訴我是什麼。」', lines().includes('沈以安：阿哲說你那週講了一句很帥的話。他不告訴我是什麼。')&&!lines().some(x=>/你換過一次方向/.test(x)));
  // 9. 接線
  { const s=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8');
    check('9. S.tick：HOME 那一段之前問 exchFormTick；phoneRules 叫 S.an15Phone', /if\(S\.exchFormTick\(GM\)\) return;[^\n]*\n(\s*for\(const f of S\.TICKS\)[^\n]*\n)?(\s*if\(typeof JP!=='undefined'[^\n]*\n)?\s*if\(typeof HOME!=='undefined'&&HOME\.at\(G\)\)\{ HOME\.tick\(GM\); return; \}/.test(s)&&/S\.an15Phone\(G\);/.test(s));
    check('9. 階梯 A5-L5 的選項②條件（LADDER_CHOICE_IF）', /'A5-L5':\{'「妳那天講的，我聽過了。」':\{flags:\['AN15_SEEN'\]\}\}/.test(s)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
