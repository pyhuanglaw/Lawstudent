// 1A-06 主線 7「姊姊」（AA_317；台詞照 AA_317 第 2 節）——不需要瀏覽器。照 AA_317 第 7 節給 BB 的驗收情境 S1～S4 寫：
//   1. 1/10 21:00 姊姊私訊三句（p:sister，對話串的名字「姊姊」）；回「好。」＝「好。不要遲到。」＋排 1/12 19:00 公館的火鍋店（late 0.25、約 30 分鐘）；「那天不行。」＝「好。那過年見。」、不排；
//   2. S3 不回：1/11 21:00「禮拜三。七點。」，之後什麼都沒有；1/11 21:00 以前回了就沒有第二則；答應了沒到＝19:45「好。那過年見。」；
//   3. 火鍋店：前兩句旁白、「你們法律系的都走這麼快喔？」、「你選了哪裡？」照路線回答（S1 台灣、S2 日本、美國）；
//   4. 選項②只給 careerLean C（S1 B＝只有①③；S2 C＝有②）；SISTER_TALK regret／other／search；收尾兩句；S4「經濟念一個多月就休學」。
// 修改前全部 FAIL。用法：node tests/sister_hotpot_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|EXCH)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js','src/exchange3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k);
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,EXCH_RULE:1,EXCH_APPLIED_DAY:D('2027-11-18')},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0,study:0},vac:{reg:{}}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; ADV.active=false; return G; };
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const TH=th=>(G.msgs||[]).filter(m=>m.th===th);
const txt=th=>TH(th).map(m=>(m.from||'')+':'+m.text);
const run=(day,h0,h1,st)=>{ st=st||0.25; G.day=day; G.weekday=wdOf(day); for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const askOf=id=>PHONE.byAsk(G,id);
(async()=>{
  const d10=D('2028-01-10'), d11=D('2028-01-11'), d12=D('2028-01-12');
  check('0. 1/10 週一、1/12 週三；ev_sister_hotpot 是出遊事件、說話的人寫「姊姊」', CALENDAR.dateOf(d10).wd===1&&CALENDAR.dateOf(d12).wd===3&&!!ev('ev_sister_hotpot')&&ev('ev_sister_hotpot').trigger==='outing'&&ev('ev_sister_hotpot').dialogue.some(l=>l.speaker==='姊姊'));
  // 1. 邀約
  fresh(d10,20,'dorm',{EXCHANGE_ROUTE:'TW'}); run(d10,20,20.9); check('1. 1/10 21:00 以前沒有', TH('p:sister').length===0);
  run(d10,21,21.25); check('1. 1/10 21:00：姊姊三句（p:sister）', JSON.stringify(txt('p:sister'))===JSON.stringify(['sister:禮拜三我來臺北出差。','sister:晚上七點，公館。請你吃火鍋。','sister:……就我們兩個。']), JSON.stringify(txt('p:sister')));
  check('1. 手機上的名字「姊姊」（對話串、說話的人）', PHONE.title(G,'p:sister')==='姊姊'&&PHONE.who(TH('p:sister')[0])==='姊姊');
  { const m=askOf('y3_sis_hotpot'); check('1. 兩個回覆：「好。」「那天不行。」', !!m&&JSON.stringify(m.ask.opts.map(o=>o.t))===JSON.stringify(['好。','那天不行。'])); }
  PHONE.answer(G,'y3_sis_hotpot',0); run(d10,21.5,21.75);
  { const q=OUT.get(G,'y3_sis_hotpot'); check('1. 回「好。」：「好。不要遲到。」＋排 1/12 19:00 公館的火鍋店（late 0.25、約 30 分鐘）', txt('p:sister').slice(-2).join('|')==='player:好。|sister:好。不要遲到。'&&!!q&&q.day===d12&&q.h===19&&q.late===0.25&&q.place==='公館的火鍋店'&&q.ev==='ev_sister_hotpot'&&q.travelH===0.5, JSON.stringify(q)); }
  fresh(d10,21,'dorm',{EXCHANGE_ROUTE:'TW'}); run(d10,21,21.25); PHONE.answer(G,'y3_sis_hotpot',1); run(d10,21.5,23); run(d11,8,23);
  check('1. 回「那天不行。」：「好。那過年見。」、不排、1/11 沒有第二則', txt('p:sister').slice(-1)[0]==='sister:好。那過年見。'&&!OUT.get(G,'y3_sis_hotpot')&&!PHONE.sent(G,'y3_sis_hotpot2'));
  // 2. S3 不回
  fresh(d10,21,'dorm',{EXCHANGE_ROUTE:'TW'}); run(d10,21,23.5); run(d11,8,20.9); check('2. S3 1/11 21:00 以前沒有第二則', !PHONE.sent(G,'y3_sis_hotpot2'));
  run(d11,21,23.5); check('2. S3 不回：1/11 21:00「禮拜三。七點。」', txt('p:sister').slice(-1)[0]==='sister:禮拜三。七點。');
  run(d12,8,23.5); run(d12+1,8,12); check('2. S3 還是不回：之後什麼都沒有（沒有出遊、姊姊一共四句）', !OUT.get(G,'y3_sis_hotpot')&&TH('p:sister').length===4, TH('p:sister').length);
  fresh(d10,21,'dorm',{EXCHANGE_ROUTE:'TW'}); run(d10,21,21.25); run(d11,9,9); PHONE.answer(G,'y3_sis_hotpot',0); run(d11,9.25,23); check('2. 1/11 早上回了：沒有第二則、排出遊', !PHONE.sent(G,'y3_sis_hotpot2')&&!!OUT.get(G,'y3_sis_hotpot'));
  // 答應了沒到
  G.day=d12; G.hour=19.3; OUT.tick(GM); run(d12,19.5,20); check('2. 答應了沒到：19:45「好。那過年見。」', OUT.get(G,'y3_sis_hotpot').state==='missed'&&TH('p:sister').some(m=>m.text==='好。那過年見。'&&Math.abs(m.h-19.75)<0.01), JSON.stringify(TH('p:sister').map(m=>m.h+' '+m.text)));
  // 3. 火鍋店
  const E7=ev('ev_sister_hotpot'); const play=async(route,flags,pick)=>{ fresh(d12,19,'gongguan',Object.assign({EXCHANGE_ROUTE:route},flags||{})); picks=[pick==null?0:pick]; await EVENTS.run(E7); return lines(); };
  let T=await play('TW',{},'還在找');
  check('3. S1 台灣路線：旁白兩句 →「你們法律系的都走這麼快喔？」→「你選了哪裡？」→「沒填。留在臺灣。」「留下來也是選了一個。」', T[0]==='（一月的公館。火鍋店的玻璃起了一層霧。姊姊已經到了，鍋子點好了，兩個人一鍋。）'&&T[1]==='（你走進來的時候，她看了一下手機上的時間。）'&&T[2]==='姊姊：你們法律系的都走這麼快喔？'&&T[3]==='姊姊：交換的表，你選了哪裡？'&&T[4]==='祐廷：沒填。留在臺灣。'&&T[5]==='姊姊：留下來也是選了一個。', JSON.stringify(T.slice(0,6)));
  check('3. S1 careerLean B：只有選項①③', STORY.careerLean(G).top==='B'&&JSON.stringify(opts[0])===JSON.stringify(['「妳後悔換方向嗎？」','「我還在找我要幹嘛。」']), JSON.stringify(opts[0]));
  check('3. 選③：SISTER_TALK search、「我二十六歲也還在找。你急什麼。」、收尾兩句', G.flags.SISTER_TALK==='search'&&T.includes('姊姊：我二十六歲也還在找。你急什麼。')&&T[T.length-2]==='（鍋底剩一點湯。她把最後一片肉夾到你碗裡。）'&&T[T.length-1]==='姊姊：過年見。');
  check('3. S4：「經濟念一個多月就休學」，不是「念一年」', T.includes('姊姊：你也換過一次。經濟念一個多月就休學，說要重考。……媽那陣子都睡不好，只是沒跟你說。')&&!T.some(t=>/念一年/.test(t)));
  check('3. 主線 7 原文四句（AA_12，AA-C 10-20 定稿）', ['姊姊：我念歷史的時候，親戚說「念那個以後要幹嘛」。我念到研究所又休學。去補習班教書。現在在出版社。','姊姊：結果你看。你自己選的，你就念得下去。','姊姊：你從小遇到事情就去翻那本書。……你知道嗎，那時候我覺得你很怪。現在覺得還好。'].every(x=>T.includes(x)));
  T=await play('JP',{},'不用現在講'); const optsJP=opts[0];
  check('3. S2 日本路線：「日本。三月底出發。」「三月。……那過年要多吃一點。」', T[4]==='祐廷：日本。三月底出發。'&&T[5]==='姊姊：三月。……那過年要多吃一點。');
  check('3. careerLean B 的日本路線也沒有②', !optsJP.some(t=>/法律以外/.test(t)));
  fresh(d12,19,'gongguan',{EXCHANGE_ROUTE:'JP'}); G.vac.reg['C08@Y2']='done'; picks=['法律以外']; await EVENTS.run(E7); T=lines();
  check('3. S2 careerLean C：有選項②；選了＝SISTER_TALK other＋她那句', STORY.careerLean(G).top==='C'&&opts[0].length===3&&opts[0][1]==='「我在想畢業以後要不要做法律以外的事。」'&&G.flags.SISTER_TALK==='other'&&T.includes('姊姊：那你喜歡什麼？……不用現在講。你換過一次，你知道換方向不會怎樣。爸媽那邊我來。'), JSON.stringify(opts[0]));
  T=await play('US',{},0); check('3. 美國路線：「美國。大四上。」「八月。那還有一個暑假。」；選①＝regret、「沒有。後悔完還是要吃飯。」', T[4]==='祐廷：美國。大四上。'&&T[5]==='姊姊：八月。那還有一個暑假。'&&G.flags.SISTER_TALK==='regret'&&T.includes('姊姊：沒有。後悔完還是要吃飯。'));
  T=await play(null,{EXCHANGE_ROUTE:undefined},0); check('3. 路線還沒有（舊存檔）：照台灣路線', T[4]==='祐廷：沒填。留在臺灣。');
  check('3. 交往中不影響：台詞沒有讀交往狀態（只讀路線、careerLean）', !JSON.stringify(E7.dialogue.map(l=>l.if&&l.if.custom?String(l.if.custom):'')).includes('dating'));
  // 4. 接線
  { const s=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'); check('4. phoneRules 叫 S.y4Phone（1A-05 那一行後面）', /S\.an15Phone\(G\);[^\n]*\n\s*S\.y4Phone\(GM\);/.test(s)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
