// 吃東西（X67；AA_329＋AA_336 第 A 節，企劃 724d7703，台詞在 src/data/eat_lines.js）：一起吃、吃過的、店員認得你——不需要瀏覽器。照 AA_329 第 5 節給 BB 的 E1～E8，台詞不寫死（讀 EAT_LINES）。
//   E1 118 巷以安在滇香吃飯、和她 FAMILIAR：點完問「坐過去一起吃」→ 開場、熟的那一組、結尾（滇香沒有回收台＝在店門口分開）；時間 +30 分鐘；關係加一點；店裡原本的「吃完」旁白不說
//   E2 同一天再點一次：不再問（一天一次）
//   E3 和學姊交往中（她不知道別人）：祐廷先說交往版的第一句（「書瑀。」）；她知道祐廷也和可昕交往＝朋友版
//   E4 第一次去好家自助餐：點餐那句 → 第一次的旁白 → 店裡吃完的旁白；筆記本「吃過的」多一筆
//   E5 同一間第二次點別的：沒有第一次的旁白（吃過的照樣記新的品項）
//   E6 六張犁麵舖第 5 次：老闆那一句（只說一次）、選單多「老樣子」＝上一次那一樣、回那一句、扣那一樣的錢
//   E7 阿鳳麵店第 5 次、語彤在顧店：那一句換她說
//   E8 可昕分開、不到朋友：她那一組（她先走）、不加關係、沒有一起收盤子那句、時間 +30 分鐘
//   其他：老樣子的換句（便利商店加熱／不用加熱）、Café 芷若在班或沒見過芷若＝不演、阿德影印不算吃過的、舊存檔沒有 G.eat、
//         Café 芷若在班時點過（CAFE_VISITS）＝記進吃過的、之後不再演第一次、宵夜滷味攤第一次的旁白（outings3d.js）、溫州街半熟、接線
//   AA_336 第 A 節（AA-C 回 LAWWW 實作問題）：A1 老樣子用主句（大碗小碗、全熟半熟不看上次點什麼）、A2 兩間麵店都算沒有回收台、
//         A3 118 巷一起吃＝40＋30＝70 分鐘、A4 便利商店第 5 次：上次沒加熱＝換句＋祐廷回一句、上次有加熱＝表上那一句
// 修改前（沒有 src/eat3d.js）：node tests/eat_unit.js --no-eat 大部分 FAIL。用法：node tests/eat_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..'), NO_EAT=process.argv.includes('--no-eat');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(HOMETOWN_LINES|HV|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|NEEDED_MSGS|ROM|MSG|MSG_POOL|MSG2_POOL|VAC|VAC_DATA|L118|LANE118_SHOPS|LANE118_LAYOUT|WZS|EAT|EAT_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js','src/romance3d.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/lane118.js','src/wzshops3d.js','src/data/eat_lines.js'].concat(NO_EAT?[]:['src/eat3d.js']);
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){},narrate(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null, toasts=[];
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0},userData:{}});
const E={q:{level:'medium'},player:{busy:false,obj:mkObj(),lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(t){ toasts.push(t); },updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  money(n){ G.money+=n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,stage:'law',day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; toasts=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; return G; };
const LV={ACQ:[8,0,0],FAM:[25,10,10],FRI:[45,30,10],LOW:[3,0,0]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv]; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const npcAt=id=>{ const n={id,charId:id,name:SOCIAL.displayName(id),obj:mkObj(),seat:{x:0,z:0},pose:'sit'}; GM.npc[id]=n; E.npcs.push(n); return n; };
const DK=k=>STORY.dayOfKey(k), td=(t,w,wd)=>STORY.termDay(t,w,wd);
const has=t=>said.some(s=>s.t===t), idx=t=>said.findIndex(s=>s.t===t);
const EL=typeof EAT_LINES!=='undefined'?EAT_LINES:{together:{},first:{},staff:{},doorShops:[]};
const shop=id=>LANE118_SHOPS.shops.find(s=>s.id===id);
(async()=>{
  check('0. 有 EAT（src/eat3d.js）、EAT_LINES（AA_329＋AA_336 第 A 節，企劃 724d7703）', typeof EAT!=='undefined'&&typeof EAT_LINES!=='undefined'&&/AA_329（企劃 724d7703）/.test(EAT_LINES.source||'')&&/AA_336/.test(EAT_LINES.source||''), EAT_LINES&&EAT_LINES.source);
  // ---------- E1 ----------
  const tue=td('Y1S1',3,2);
  fresh(tue,12.4,'l118_dian'); R('heroine_01','FAM'); const an=npcAt('heroine_01');
  { const e=STORY.schedEnt(CHARACTERS.heroine_01,G); check('E1 前置：Y1S1 第 3 週週二 12:24 以安照作息在滇香吃飯（l118_dian、eat）、店開著、不是門口的常客', !!e&&e.zone==='l118_dian'&&e.act==='eat'&&L118.isOpen('dian',G)&&!L118.companions(GM,'dian').includes('heroine_01'), JSON.stringify(e&&{zone:e.zone,act:e.act})); }
  const fam0=SOCIAL.rel('heroine_01').fam; let h0=null; const say0=GM.say; GM.say=async(w,t)=>{ if(t===EL.open) h0=G.hour; return say0(w,t); };
  const hS=G.hour; picks=[0,'坐過去一起吃']; await L118.order(GM,'dian'); GM.say=say0;
  const S1=EL.together.heroine_01||{}, set1=(S1.FAM||[]).map(x=>x[1]);
  check('E1 點完問「坐過去一起吃」（選項兩個：坐過去一起吃、不用了）', opts.length>=2&&JSON.stringify(opts[1])===JSON.stringify(['坐過去一起吃','不用了']), JSON.stringify(opts));
  check('E1 開場 → 熟的那一組（照順序）→ 在店門口分開（滇香沒有回收台）', has(EL.open)&&set1.length&&set1.every(t=>has(t))&&idx(EL.open)<idx(set1[0])&&idx(set1[set1.length-1])<idx(EL.closeDoor)&&!has(EL.closeRecycle), said.map(s=>s.t).join('｜'));
  check('E1 一起吃的時候店裡原本的「吃完」旁白不說；第一次的旁白在點餐那句之後、一起吃之前', !has(shop('dian').done)&&idx(LANE118_SHOPS.orderLine.replace('{品名}',shop('dian').menu[0][0]))<idx(EL.first['118 巷・滇香小館'])&&idx(EL.first['118 巷・滇香小館'])<idx(EL.open));
  check('E1 一起吃那一段時間 +30 分鐘、關係加一點（日常的一起吃飯）', h0!=null&&Math.abs(G.hour-h0-0.5)<1e-6&&SOCIAL.rel('heroine_01').fam>fam0, 'h0='+h0+' h='+G.hour+' fam '+fam0+'→'+SOCIAL.rel('heroine_01').fam);
  check('A3（AA_336）E1 點餐到吃完一共 70 分鐘：店裡原本吃飯的 40 分鐘＋一起吃 30 分鐘', Math.abs(G.hour-hS-70/60)<1e-6, 'hS='+hS+' h='+G.hour);
  // ---------- E2 ----------
  said=[]; opts=[]; picks=[1]; await L118.order(GM,'dian');
  check('E2 同一天再點一次：不再問「坐過去一起吃」、照舊說店裡吃完的旁白', !opts.some(o=>o.includes('坐過去一起吃'))&&has(shop('dian').done), JSON.stringify(opts));
  // ---------- E3 ----------
  const tue2=td('Y2S1',3,2);
  fresh(tue2,17.6,'l118_self',{dating_heroine_05:true}); R('heroine_05','FRI'); npcAt('heroine_05');
  { const e=STORY.schedEnt(CHARACTERS.heroine_05,G); check('E3 前置：Y2S1 第 3 週週二 17:36 學姊在好家自助餐吃飯、店開著', !!e&&e.zone==='l118_self'&&e.act==='eat'&&L118.isOpen('self',G), JSON.stringify(e&&{zone:e.zone,act:e.act})); }
  picks=[0,'坐過去一起吃']; await L118.order(GM,'self'); const D5=(EL.together.heroine_05||{}).dating||[];
  check('E3 和學姊交往中：交往版——祐廷先說第一句（「書瑀。」），接她的兩句；自助餐有回收台＝一起收盤子', D5.length&&D5[0][0]==='me'&&said.some(s=>s.who==='祐廷'&&s.t===D5[0][1])&&D5.every(x=>has(x[1]))&&has(EL.closeRecycle), said.map(s=>(s.who||'')+':'+s.t).join('｜'));
  fresh(tue2,17.6,'l118_self',{dating_heroine_05:true,dating_kexin:true}); R('heroine_05','FRI'); npcAt('heroine_05'); ROM.learn(G,'heroine_05','kexin','test');
  picks=[0,'坐過去一起吃']; await L118.order(GM,'self'); const F5=(EL.together.heroine_05||{}).FRI||[];
  check('E3 她知道祐廷也和可昕交往：朋友版（不是交往版）', F5.length&&F5.every(x=>has(x[1]))&&!has(D5[0]&&D5[0][1]), said.map(s=>s.t).join('｜'));
  // ---------- E4、E5 ----------
  fresh(td('Y1S1',4,3),12.2,'l118_self');
  picks=[0]; await L118.order(GM,'self'); const f4=EL.first['118 巷・好家自助餐'], o4=LANE118_SHOPS.orderLine.replace('{品名}',shop('self').menu[0][0]);
  check('E4 第一次去好家自助餐：點餐那句 → 第一次的旁白 → 店裡吃完的旁白', !!f4&&idx(o4)>=0&&idx(o4)<idx(f4)&&idx(f4)<idx(shop('self').done), said.map(s=>s.t).join('｜'));
  check('E4 筆記本「吃過的」多一筆（店名、品項、日期）', G.eat&&G.eat.ate.length===1&&G.eat.ate[0].shop==='118 巷・好家自助餐'&&G.eat.ate[0].item===shop('self').menu[0][0]&&G.eat.ate[0].day===G.day&&/吃過的/.test(EAT.notesHTML(G))&&EAT.notesHTML(G).includes('118 巷・好家自助餐'), JSON.stringify(G.eat&&G.eat.ate));
  said=[]; picks=[1]; await L118.order(GM,'self');
  check('E5 同一間第二次點別的：沒有第一次的旁白；吃過的記新的品項', !has(f4)&&G.eat.ate.length===2&&G.eat.ate[1].item===shop('self').menu[1][0], said.map(s=>s.t).join('｜'));
  // ---------- E6 ----------
  fresh(td('Y1S1',4,1),12.2,'l118_noodle2'); G.eat={n:{'六張犁麵舖':4},last:{'六張犁麵舖':'牛肉麵'}}; const m0=G.money, T6=EL.staff['六張犁麵舖']||{};
  picks=['老樣子']; await L118.order(GM,'noodle2');
  check('E6 第 5 次：老闆那一句在選單之前', said.some(s=>s.who===T6.who&&s.t===T6.line5)&&idx(T6.line5)>idx(shop('noodle2').greet.text), said.map(s=>(s.who||'')+':'+s.t).join('｜'));
  check('E6 選單多「老樣子」（在品項後面、「不用了」前面）；選了＝回「好。大碗。」、扣上一次那一樣（牛肉麵）的錢', opts[0]&&opts[0][shop('noodle2').menu.length]==='老樣子'&&opts[0][opts[0].length-1]==='不用了'&&has(T6.same)&&G.money===m0-150&&G.eat.n['六張犁麵舖']===5, JSON.stringify(opts[0])+' money '+(m0-G.money));
  said=[]; opts=[]; picks=[0]; await L118.order(GM,'noodle2');
  check('E6 那一句只說一次；之後選單照樣有「老樣子」', !has(T6.line5)&&opts[0].includes('老樣子'));
  { const TO=EL.staff['蛋包飯研究所']||{};
    check('A1（AA_336）老樣子用主句、不看上次點什麼：六張犁麵舖、蛋包飯研究所就算上次的品名有「小碗」「全熟」也回主句', !!T6.same&&!!TO.same&&EAT.sameLine(T6,'小碗牛肉麵')===T6.same&&EAT.sameLine(TO,'全熟咖哩蛋包飯')===TO.same);
    fresh(td('Y1S1',4,2),12.2,'l118_omu'); G.eat={n:{'蛋包飯研究所':5},last:{'蛋包飯研究所':'咖哩蛋包飯'},l5:{'蛋包飯研究所':1}}; picks=['老樣子']; await L118.order(GM,'omu');
    check('A1 蛋包飯研究所選「老樣子」＝店員回主句（不是全熟那句）；沒有全熟半熟的點餐步驟（只有一個選單：品項＋老樣子＋不用了）', has(TO.same)&&!(TO.alt&&has(TO.alt.t))&&opts.length===1&&opts[0].length===shop('omu').menu.length+2, JSON.stringify(opts)+' '+said.map(s=>s.t).join('｜')); }
  check('A2（AA_336）沒有回收台的「麵店」＝阿鳳麵店、六張犁麵舖兩間都算', EAT.isDoor('阿鳳麵店')&&EAT.isDoor('六張犁麵舖'));
  // ---------- E7 ----------
  const tueY=td('Y1S2',4,2); fresh(tueY,18,'noodle'); npcAt('heroine_03'); G.eat={n:{'阿鳳麵店':4},last:{'阿鳳麵店':'乾麵'}};
  { const e=STORY.schedEnt(CHARACTERS.heroine_03,G); check('E7 前置：週二 18:00 語彤在阿鳳麵店顧店（act help）', !!e&&e.zone==='noodle'&&e.act==='help', JSON.stringify(e&&{zone:e.zone,act:e.act})); }
  picks=['老樣子']; await STORY.interact({eat:'noodle',seat:{x:0,z:0}},GM); const Y=EL.staffYutong||[], T7=EL.staff['阿鳳麵店']||{};
  check('E7 第 5 次、語彤在顧店：那一句換她說（不是阿姨那句）；老樣子＝乾麵', Y[1]&&said.some(s=>s.who===SOCIAL.displayName('heroine_03')&&s.t===Y[1])&&!has(T7.line5)&&has(T7.same)&&has('乾麵很燙。老闆娘多給了一匙肉燥。'), said.map(s=>(s.who||'')+':'+s.t).join('｜'));
  fresh(tueY,13,'noodle'); G.eat={n:{'阿鳳麵店':4},last:{'阿鳳麵店':'乾麵'}}; picks=[1]; await STORY.interact({eat:'noodle',seat:{x:0,z:0}},GM);
  check('E7 語彤不在：阿姨那一句', has(T7.line5)&&said.some(s=>s.who===T7.who&&s.t===T7.line5));
  // ---------- E8 ----------
  fresh(tue,12.4,'l118_dian',{EX_kexin:true}); R('kexin','LOW'); const kx=npcAt('kexin'); const eh=EAT.eatingHere; EAT.eatingHere=(gm,id)=>id==='kexin'?true:eh(gm,id);
  const r0=JSON.stringify(SOCIAL.rel('kexin')); let h8=null; const s8=GM.say; GM.say=async(w,t)=>{ if(t===EL.open) h8=G.hour; return s8(w,t); };
  picks=[0,'坐過去一起吃']; await L118.order(GM,'dian'); GM.say=s8; EAT.eatingHere=eh; const X8=(EL.together.kexin||{}).exLow||[];
  check('E8 可昕分開、不到朋友：她那一組（她先走）、沒有一起收盤子／在門口分開那句', X8.length&&X8.every(x=>has(x[1]))&&!has(EL.closeDoor)&&!has(EL.closeRecycle), said.map(s=>s.t).join('｜'));
  check('E8 不加關係、時間 +30 分鐘、她要走了（until）', JSON.stringify(SOCIAL.rel('kexin'))===r0&&h8!=null&&Math.abs(G.hour-h8-0.5)<1e-6&&kx.until!=null);
  fresh(tue,12.4,'l118_dian',{EX_kexin:true}); R('kexin','FRI'); npcAt('kexin'); EAT.eatingHere=(gm,id)=>id==='kexin'; picks=[0,'坐過去一起吃']; await L118.order(GM,'dian'); EAT.eatingHere=eh;
  check('E8 分開以後朋友以上：exFriend 那一組＋結尾', ((EL.together.kexin||{}).exFriend||[]).every(x=>has(x[1]))&&has(EL.closeDoor));
  fresh(tue,12.4,'l118_dian'); R('heroine_01','FAM'); npcAt('heroine_01'); picks=[0,'不用了']; await L118.order(GM,'dian');
  check('E1 選「不用了」：照舊店裡吃完的旁白；今天不再問', has(shop('dian').done)&&!has(EL.open)&&G.eat.tog.heroine_01===G.day);
  fresh(tue,12.4,'l118_dian'); npcAt('heroine_01'); picks=[0]; await L118.order(GM,'dian');
  check('E1 沒見過以安（FIRST_MET）：不問', !opts.some(o=>o.includes('坐過去一起吃')));
  // ---------- 老樣子的換句（便利商店）----------
  const cvsRun=async last=>{ fresh(td('Y1S1',5,2),15,'cvs'); G.eat={n:{'公館的便利商店':5},last:{'公館的便利商店':last},l5:{'公館的便利商店':1}}; picks=['老樣子']; await STORY.interact({shop:'cvs'},GM); };
  const T9=EL.staff['公館的便利商店']||{};
  await cvsRun('微波義大利麵'); check('便利商店：上次是微波義大利麵＝「好，加熱。」', has(T9.same)&&!has(T9.alt&&T9.alt.t), said.map(s=>s.t).join('｜'));
  await cvsRun('飯糰'); check('便利商店：上次沒加熱（飯糰）＝「好，不用加熱。」', T9.alt&&has(T9.alt.t)&&!has(T9.same), said.map(s=>s.t).join('｜'));
  check('便利商店：老樣子在食物後面、貓罐頭／開學用品之前（序號對得回原本的選單）', opts[0]&&opts[0].indexOf('老樣子')===4);
  const cvs5=async last=>{ fresh(td('Y1S1',5,2),15,'cvs'); G.eat={n:{'公館的便利商店':4},last:{'公館的便利商店':last}}; picks=['老樣子']; await STORY.interact({shop:'cvs'},GM); };
  const A9=T9.line5Alt||{};
  await cvs5('飯糰'); check('A4（AA_336）便利商店第 5 次、上次沒加熱（飯糰）：店員說換句（line5Alt）→ 祐廷回一句 → 老樣子＝不用加熱那句；不說「你每次都要」那句', !!A9.t&&!!A9.reply&&said.some(s=>s.who===T9.who&&s.t===A9.t)&&said.some(s=>s.who==='祐廷'&&s.t===A9.reply)&&idx(A9.t)<said.findIndex(s=>s.who==='祐廷'&&s.t===A9.reply)&&T9.alt&&said.findIndex(s=>s.who==='祐廷'&&s.t===A9.reply)<idx(T9.alt.t)&&!has(T9.line5)&&G.eat.l5['公館的便利商店']===G.day, said.map(s=>(s.who||'')+':'+s.t).join('｜'));
  await cvs5('微波義大利麵'); check('A4 便利商店第 5 次、上次有加熱（微波義大利麵）：照表上那一句、沒有換句、祐廷不回', said.some(s=>s.who===T9.who&&s.t===T9.line5)&&!has(A9.t)&&!said.some(s=>s.who==='祐廷'), said.map(s=>(s.who||'')+':'+s.t).join('｜'));
  // ---------- Café ----------
  const cafe=async(fl,zr)=>{ fresh(td('Y1S1',5,4),15,'cafe',fl); G.eat={n:{'兩點半 Café':4},last:{'兩點半 Café':'拿鐵'}}; if(zr){ const n=npcAt('heroine_02'); n.staff='cafe'; } picks=[2]; await STORY.interact({counter:'cafe'},GM); };
  const TC=EL.staff['兩點半 Café']||{};
  await cafe({}); SOCIAL.remember('heroine_02','FIRST_MET',''); check('Café 沒見過芷若：老闆那句（芷若交代過）不說、沒有老樣子', !has(TC.line5)&&!opts[0].includes('老樣子'));
  fresh(td('Y1S1',5,4),15,'cafe'); SOCIAL.remember('heroine_02','FIRST_MET',''); G.eat={n:{'兩點半 Café':4},last:{'兩點半 Café':'拿鐵'}}; picks=[2]; await STORY.interact({counter:'cafe'},GM);
  check('Café 芷若不在班、見過她：老闆那句、有老樣子', has(TC.line5)&&said.some(s=>s.who==='老闆'&&s.t===TC.line5)&&opts[0].includes('老樣子'), said.map(s=>(s.who||'')+':'+s.t).join('｜'));
  fresh(td('Y1S1',5,4),15,'cafe'); SOCIAL.remember('heroine_02','FIRST_MET',''); G.eat={n:{'兩點半 Café':4},last:{'兩點半 Café':'拿鐵'}}; { const n=npcAt('heroine_02'); n.staff='cafe'; } picks=[2]; await STORY.interact({counter:'cafe'},GM);
  check('Café 芷若在班：照她的點法，這一套不演', !has(TC.line5)&&!opts[0].includes('老樣子'));
  fresh(td('Y1S1',5,4),15,'cafe',{CAFE_VISITS:1,zhiruoFirstOrder:'手沖'});
  check('Café 芷若在班時點過（CAFE_VISITS）：登記在 STORY.TICKS', Array.isArray(STORY.TICKS)&&STORY.TICKS.length>0);
  EAT.tickCafe(GM); picks=[0]; await STORY.interact({counter:'cafe'},GM);
  check('Café：芷若那邊點過＝記進吃過的（手沖）、之後老闆那邊點不再演第一次', G.eat.ate.some(a=>a.shop==='兩點半 Café'&&a.item==='手沖')&&!has(EL.first['兩點半 Café']), JSON.stringify(G.eat.ate));
  fresh(td('Y1S1',5,4),15,'cafe'); picks=[0]; await STORY.interact({counter:'cafe'},GM);
  check('Café 第一次（芷若不在）：買了那句之後第一次的旁白', idx(EL.first['兩點半 Café'])>idx('你買了拿鐵。店員把杯子放在你面前的時候，杯底和木桌碰出一聲很小的響。'));
  // ---------- 阿德影印、舊存檔、宵夜、溫州街 ----------
  fresh(td('Y1S1',7,2),15,'wenzhou'); G.eat={n:{'阿德影印輸出':4},last:{'阿德影印輸出':'印筆記（黑白，約 30 頁）'}}; picks=['老樣子']; await WZS.interact(GM,{wzShop:'print',kind:'print'}); const TP=EL.staff['阿德影印輸出']||{};
  check('阿德影印第 5 次：「又是考古題？」、老樣子＝上一次印的、不記吃過的', has(TP.line5)&&has(TP.same)&&!(G.eat.ate||[]).length, said.map(s=>s.t).join('｜'));
  fresh(td('Y1S1',4,3),12.2,'l118_self'); delete G.eat; picks=[0]; let err=null; try{ await L118.order(GM,'self'); }catch(e){ err=e; }
  check('舊存檔沒有 G.eat：照常點餐、建一個新的', !err&&G.eat&&G.eat.n['好家自助餐']===1&&Array.isArray(G.eat.ate), String(err));
  fresh(td('Y1S1',8,3),20.5,'gongguan'); const L1=EL.first['宵夜（公館滷味攤）']; await EAT.outingFirst(GM,{place:'公館滷味攤'}); const n1=said.length; await EAT.outingFirst(GM,{place:'公館滷味攤'});
  check('宵夜滷味攤：第一次去一句旁白、記吃過的；第二次不演', has(L1)&&n1===1&&said.length===1&&G.eat.ate.some(a=>a.shop==='宵夜（公館滷味攤）'));
  { const o=fs.readFileSync(path.join(ROOT,'src/outings3d.js'),'utf8'); check('接線：outings3d.js 演事件之前（beforeOuting 之前）叫 EAT.outingFirst', /EAT\.outingFirst\(GM,q\);[^\n]*if\(typeof ev\.beforeOuting==='function'\)/.test(o)); }
  fresh(td('Y1S1',7,6),10,'wenzhou'); picks=[0]; await WZS.interact(GM,{wzShop:'brunch',kind:'cashier'}); const fb=EL.first['溫州街・半熟'];
  check('溫州街半熟第一次：第一次的旁白在吃的旁白之前', !!fb&&idx(fb)>=0&&idx(fb)<idx(WZS.BRUNCH[0][2]), said.map(s=>s.t).join('｜'));
  // ---------- 接線 ----------
  { const s=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), l=fs.readFileSync(path.join(ROOT,'src/lane118.js'),'utf8'), w=fs.readFileSync(path.join(ROOT,'src/wzshops3d.js'),'utf8'), g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
    check('接線：lane118.js、story3d.js（Café、便利商店、麵店）、wzshops3d.js、筆記本、index.html 載入 eat_lines.js 和 eat3d.js', /EAT\.choose\(GM,s\.name/.test(l)&&/EAT\.together\(GM,s\.name\)/.test(l)&&/EAT\.choose\(GM,ek,opts/.test(s)&&/EAT\.choose\(GM,'阿鳳麵店'/.test(s)&&/EAT\.together\(GM,'阿鳳麵店'\)/.test(s)&&/EAT\.after\(GM,key,it\[0\]\)/.test(w)&&/EAT\.notesHTML\(G,dayLab\)/.test(g)&&h.indexOf('src/data/eat_lines.js')>0&&h.indexOf('src/eat3d.js')>h.indexOf('src/data/eat_lines.js')&&h.indexOf('src/eat3d.js')>h.indexOf('src/story3d.js')); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
