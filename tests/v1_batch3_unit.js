// 交接包 v1（大一上）第 3 批：BB 的現有事件改寫（BB_95 2-1、2-3～2-7）——不需要瀏覽器。
// 檢查（修改前都會失敗）：
//   W1 學姊第一次見面（talkSis）：六句、照群組有沒有回（回過／沒講過／舊存檔沒有群組＝不提）、民總之前／之後兩種、記 FIRST_MET、之後的隨機台詞是新的三句。
//   Q1 阿凱轉述子晴：第 4 週（第 6 天起）才觸發；台詞不動。
//   Z2 經原分組：「網拍標錯價」之後芷若的兩句；加入小組群組、她的第一則；期末（第 18 週）旁白一行、不排「第一個」。
//   W2＋P1 讀書會：「大專生研究計畫」；沛珊 P1 四句在第一題之後、PEISHAN_ASKED_WHY；散會的便條；沒認識沛珊的玩家散會時她自我介紹（FIRST_MET）、已經認識的不說；
//     收書包也走到散會；那晚 22:30 讀書會群組的四句（不是私訊）。
//   Q2 吉他社：有／沒有 guitar_invite 兩種開場（只出現一種）、「今天系上有程式比賽……」、「為什麼不去比賽？」不扣 trust、接「C 和弦再按一次。手指不要放。」、沒有「阿凱話很多」；
//     第一次去的晚上進吉他社群組、她的第一則。
//   Q3 公館的晚上：交往中「阿凱也在，他在排隊」、三個人；拍照那段（交往中阿凱多一句）只一次（ZIQING_MAKING_SOMETHING）；單身照舊「十點後半價」。
// 用法：node tests/v1_batch3_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/story3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
let legalAsked=0; global.LEGAL={ask:async()=>{ legalAsked++; said.push({who:'LEGAL',t:'〔題目〕'}); },apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], relCalls=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){}};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},titleCard:()=>Promise.resolve(),enter:()=>Promise.resolve(),phoneBadge(){},
  advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(id,v){ relCalls.push([id,v]); },walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const dayOfWeek=(week,wd)=>{ for(let d=1;d<400;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y1S1'&&t.week===week&&CALENDAR.dateOf(d).wd===wd) return d; } return null; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}}; SOCIAL.bind(G); EVENTS.bind(GM); said=[]; opts=[]; picks=[]; legalAsked=0; relCalls=[]; GM.npc={}; };
const lines=()=>said.filter(s=>s.who!=='LEGAL').map(s=>s.t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id)||(typeof STORY_EVENTS_V11!=='undefined'&&STORY_EVENTS_V11.find(e=>e.id===id));
const sisN={id:'sis',charId:'heroine_05',name:'溫學姊',obj:{position:{x:1,y:0,z:1}},seat:null};
(async()=>{
  /* ---------- W1 ---------- */
  const W1=(head,third)=>[head,'我是溫學姊，法律服務社。三件事。','一，法服週三晚上在萬才館。','二，一年級去會被操。但真的學得到東西。',third,'（看了一下手錶）好，我要走了。不用現在決定。'];
  const AFTER='三，先把民總讀好。周老師的課你被點過了吧？消息傳很快。', BEFORE='三，先把民總讀好。周老師的課在明天吧？他會點人。';
  for(const [why,flags,want] of [['群組沒回',{FAM_GROUP_SENT:true,classDone:true},W1('一年級的？……喔，你是我的直屬。群組裡沒講過話的那個。',AFTER)],
                                 ['群組回過',{FAM_GROUP_SENT:true,FAM_GROUP_REPLIED:true,classDone:true},W1('一年級的？……喔，你是我的直屬。群組裡回過話的那個。',AFTER)],
                                 ['舊存檔（沒有群組）',{classDone:true},W1('一年級的？……喔，你是我的直屬。',AFTER)],
                                 ['第一堂民總之前',{FAM_GROUP_SENT:true},W1('一年級的？……喔，你是我的直屬。群組裡沒講過話的那個。',BEFORE)]]){
    fresh(3,15.5,'wancai',flags); await STORY._v1.talkSis(GM,sisN);
    check('W1 '+why+'：六句（BB_95 2-1 原文）',JSON.stringify(lines())===JSON.stringify(want),JSON.stringify(lines())); }
  check('W1 第一次：met_sis、FIRST_MET、學姊 +3',G.flags.met_sis===true&&SOCIAL.has('heroine_05','FIRST_MET')&&relCalls.some(([id,v])=>id==='sis'&&v===3));
  said=[]; await STORY._v1.talkSis(GM,sisN); const R=['兩件事。一，判決要看事實。二，不要只背結論。','法服週三晚上。來不來都可以。重點是先來看一次。','總圖三樓的判例彙編，去年被人翻到脫頁。……不是我。'];
  check('W1 之後的隨機台詞是新的三句之一（條列口吻）',lines().length===1&&R.includes(lines()[0]),JSON.stringify(lines()));
  /* ---------- Q1 ---------- */
  { const e=ev('ev_kai_mentions_ziqing'); fresh(5,20,'dorm'); const a=EVENTS.check(e); G.day=6; G.weekday=wdOf(6); const b=EVENTS.check(e);
    check('Q1 第 4 週（第 6 天起）才觸發',a===false&&b===true&&CALENDAR.termOf(6).week===4,JSON.stringify({a,b,week:CALENDAR.termOf(6).week})); }
  /* ---------- Z2 ---------- */
  { const e=ev('ev_zhiruo_ge_group'); const fri=dayOfWeek(4,5); fresh(fri,12.3,'putong',{dating_kexin:true}); picks=['網拍']; await EVENTS.run(e); const L=lines();
    check('Z2 「網拍標錯價」之後芷若的兩句（BB_95 2-4 原文），再接原本的收尾',L.includes('（眼睛一亮）一千元的相機那種？你們法律系上課講這個？')&&L.includes('……好，這個可以拍成短片。我剪片。你負責講。')&&L[L.length-1]==='太好了。組員裡有一個法律系的，老師會怕我們。',JSON.stringify(L));
    STORY.phoneRules(GM); G.hour+=0.3; PHONE.tick(G); const T=PHONE.thread(G,'g:ge_econ');
    check('Z2 加入小組群組，她的第一則「我負責剪片。不要叫我上台。」',PHONE.inGroup(G,'ge_econ')&&T.length===1&&T[0].from==='heroine_02'&&T[0].text==='我負責剪片。不要叫我上台。',JSON.stringify(T.map(m=>m.text)));
    fresh(fri,12.3,'putong'); picks=['報告很爛']; await EVENTS.run(e); check('Z2 另一個加入的選項：沒有「網拍」那兩句、照樣加入',!lines().some(t=>/一千元的相機/.test(t))&&G.flags.ge_group_zhiruo===true&&G.flags.geGroupDay===fri);
    fresh(fri,12.3,'putong'); picks=['已經有組']; await EVENTS.run(e); STORY.phoneRules(GM); check('Z2 「我已經有組了。」：不加入群組',!G.flags.ge_group_zhiruo&&!PHONE.inGroup(G,'ge_econ'));
    const fin=ev('ev_zhiruo_ge_final'); fresh(dayOfWeek(17,3),20,'dorm',{ge_group_zhiruo:true}); const a=EVENTS.check(fin); fresh(dayOfWeek(18,3),20,'dorm',{ge_group_zhiruo:true}); const b=EVENTS.check(fin);
    await EVENTS.run(fin); check('Z2 期末（第 18 週）旁白一行（不排「第一個」），第 17 週還沒有',a===false&&b===true&&lines()[0]==='三分鐘的短片，旁白是你。片尾名單照筆畫排，你的名字後面多了兩個字：（旁白）。'&&!/第一個/.test(lines()[0])); }
  /* ---------- W2＋P1 ---------- */
  { const e=ev('ev_studygroup_wed'); const wed=dayOfWeek(5,3); const P1=['（舉手，停了一下）……我們為什麼要背這個？','因為會考。','（笑）好。這是一個答案。','……好問題。下週回答。'];
    fresh(wed,19.2,'wancai',{lawclub:true}); picks=['收書包']; await EVENTS.run(e); const S2=said.map(s=>s.t), L=lines(); const q1=S2.indexOf('〔題目〕');
    check('W2 開場、柏翰照舊；三題 legal',L[0]==='來了？坐。今天讀刑訴——一年級聽不懂沒關係，先聽爭點怎麼吵。'&&legalAsked===3);
    check('W2 沛珊 P1 四句在第一題之後（BB_95 2-5 原文）、設 PEISHAN_ASKED_WHY',JSON.stringify(S2.slice(q1+1,q1+5))===JSON.stringify(P1)&&G.flags.PEISHAN_ASKED_WHY===true,JSON.stringify(S2.slice(q1,q1+6)));
    check('W2 「……我下週要交大專生研究計畫。你們大三就會知道那是什麼東西。」（沒有「公法組」）',L.includes('今天先到這裡。……我下週要交大專生研究計畫。你們大三就會知道那是什麼東西。')&&!L.some(t=>/公法組/.test(t)));
    check('W2 選「收書包」也走到散會：便條（一，論點不清。二，引用錯頁。三，字太醜。）',L.some(t=>/便條/.test(t)&&/一，論點不清。二，引用錯頁。三，字太醜。/.test(t)));
    check('W2 沒認識沛珊：散會時「郭沛珊。法律一。剛剛那個問題是我問的。」、記 FIRST_MET',L[L.length-1]==='郭沛珊。法律一。剛剛那個問題是我問的。'&&SOCIAL.has('classmate_peishan','FIRST_MET'),L[L.length-1]);
    STORY.phoneRules(GM); G.hour=22.55; PHONE.tick(G); const T=PHONE.thread(G,'g:lawclub_study');
    check('W2 那晚 22:30 法服讀書會群組（不是私訊）的四句',PHONE.inGroup(G,'lawclub_study')&&JSON.stringify(T.map(m=>m.text))===JSON.stringify(['三件事。','一，下週還是刑訴，一年級聽就好。','二，民總第三章自己先讀，那個比較重要。','三，不要遲到。'])&&T.every(m=>m.name==='溫學姊')&&!PHONE.thread(G,'p:heroine_05').length,JSON.stringify(T.map(m=>m.text)));
    fresh(wed,19.2,'wancai',{lawclub:true}); SOCIAL.meet('classmate_peishan','campus'); picks=['研究計畫是什麼']; await EVENTS.run(e);
    check('W2 已經認識沛珊（迎新見過）：問了問題、散會不再自我介紹',lines().includes('（舉手，停了一下）……我們為什麼要背這個？')&&!lines().some(t=>/郭沛珊。法律一/.test(t)));
    fresh(wed,19.2,'wancai',{lawclub:true,PEISHAN_ASKED_WHY:true}); await EVENTS.run(e); check('W2 P1 只有一次（PEISHAN_ASKED_WHY 之後不再問）',!lines().some(t=>/為什麼要背這個/.test(t))); }
  /* ---------- Q2 ---------- */
  { const e=ev('ev_ziqing_club'); const mon=dayOfWeek(5,1);
    for(const inv of [true,false]){ fresh(mon,19.2,'wancai',inv?{guitar_invite:true}:{}); await EVENTS.run(e); const L=lines();
      const want=inv?'欸不是，你就是阿凱的室友？法律系那個？':'新人？……法律系的？放心，我們社團沒有人會告人。', other=inv?'新人？……法律系的？放心，我們社團沒有人會告人。':'欸不是，你就是阿凱的室友？法律系那個？';
      check('Q2 '+(inv?'有':'沒有')+' guitar_invite：開場只有「'+want.slice(0,8)+'…」那一種，接自我介紹和「今天系上有程式比賽。我沒去。我來這裡彈吉他。」',L[0]===want&&!L.includes(other)&&L[1]==='我高子晴。資工二。先講好：我們社團沒有人會彈，都是來吃東西的。'&&L[2]==='今天系上有程式比賽。我沒去。我來這裡彈吉他。',JSON.stringify(L.slice(0,3))); }
    STORY.phoneRules(GM); G.hour=21.6; PHONE.tick(G); const T=PHONE.thread(G,'g:guitar');
    check('Q2 第一次去的晚上：進吉他社群組，她的第一則「新人自己報名字，不要讓我問。這不是問句。」',PHONE.inGroup(G,'guitar')&&T.length===1&&T[0].text==='新人自己報名字，不要讓我問。這不是問句。');
    fresh(mon+7,19.2,'wancai',{}); SOCIAL.meet('heroine_04','wancai'); SOCIAL.adjust('heroine_04',{fam:40,trust:20,comf:20}); const r0=Object.assign({},SOCIAL.rel('heroine_04')); picks=['為什麼不去比賽']; await EVENTS.run(e); const r1=SOCIAL.rel('heroine_04'), L=lines();
    check('Q2 「為什麼不去比賽？」（沒有「阿凱說妳系上第一名」）',opts[0].includes('「為什麼不去比賽？」')&&!opts[0].some(t=>/第一名/.test(t)),JSON.stringify(opts[0]));
    check('Q2 不扣 trust、fam +3',r1.trust===r0.trust&&r1.fam-r0.fam===3,JSON.stringify({trust:[r0.trust,r1.trust],fam:[r0.fam,r1.fam]}));
    check('Q2 回答：「那是別人覺得我『應該』去的地方……」接「C 和弦再按一次。手指不要放。」，沒有「阿凱話很多」',L.includes('因為那是別人覺得我「應該」去的地方。我家已經有一個「應該」了，我不想再多一個。')&&L.includes('C 和弦再按一次。手指不要放。')&&!L.some(t=>/阿凱話很多/.test(t)),JSON.stringify(L)); }
  /* ---------- Q3 ---------- */
  { const e=ev('ev_ziqing_gongguan_night'); const setup=f=>{ fresh(30,21.5,'gongguan',f); SOCIAL.meet('heroine_04','wancai'); SOCIAL.adjust('heroine_04',{fam:40,trust:20,comf:20}); picks=['宵夜']; };
    const PHOTO=['滷味點完，她拿手機拍了一張照片。','拍什麼？','素材。我在做一個東西。……你不要問。','（三秒後）你可以問一點點。','……不行，還是不要問。'];
    setup({dating_kexin:true}); await EVENTS.run(e); let L=lines();
    check('Q3 交往中：「滷味。走。阿凱也在，他在排隊。」（三個人；沒有「十點後半價」）',L.includes('滷味。走。阿凱也在，他在排隊。')&&!L.some(t=>/十點後半價/.test(t)),JSON.stringify(L));
    check('Q3 交往中：拍照那段（BB_95 2-7 原文）＋阿凱「她每次都拍，從來不給看。」、設 ZIQING_MAKING_SOMETHING',PHOTO.every(t=>L.includes(t))&&L.includes('她每次都拍，從來不給看。')&&G.flags.ZIQING_MAKING_SOMETHING===true);
    said=[]; picks=['宵夜']; G.day+=3; await EVENTS.run(e); L=lines(); check('Q3 之後一起吃宵夜不再重演拍照',L.includes('滷味。走。阿凱也在，他在排隊。')&&!L.some(t=>/拍了一張照片/.test(t)));
    setup({}); await EVENTS.run(e); L=lines(); check('Q3 單身：照舊「滷味。走。我知道一家十點後半價的。」、拍照那段有、沒有阿凱那句',L.includes('滷味。走。我知道一家十點後半價的。')&&PHOTO.every(t=>L.includes(t))&&!L.includes('她每次都拍，從來不給看。')); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
