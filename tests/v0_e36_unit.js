// v0 ★E36 放榜（BB_104 8-11、8b-19；AA_154 A35、2-4b）：10:00 私訊＋出發選單、椰林大道 3D、帶到場（在家／睡著）、E36_REPLY／E36_PACT、22:00 放榜的宵夜、23:30 群組照片——不需要瀏覽器。
// 修改前沒有 ev_y0_e36（全部失敗）。用法：node tests/v0_e36_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
let spawned=[]; GM.spawnCharacter=(id,x,z,o)=>{ spawned.push([id,x,z]); return null; };
let menus=[], script=[]; GM.choose=async o=>{ const t=o.map(q=>q.t||q.text); menus.push(t); const w=script.shift(); if(w==null) throw new Error('STOP'); const k=t.findIndex(x=>x.includes(w)); return k<0?0:k; };
const loop=async()=>{ try{ await HOME.loop(GM); }catch(e){ if(e.message!=='STOP') throw e; } };
const atHome=()=>{ G.stage='econ'; Object.assign(G.flags,{Y0_MOVED_OUT:true,LEAVE_WEEK:6,Y0_LEFT:true}); const H=HOME.rec(G); H.at=true; H.base=true; H.day=G.day; };
const grp=()=>(G.msgs||[]).filter(m=>/^g:econ/.test(m.th)).map(m=>m.text);
(async()=>{
  const D=STORY.dayOfKey('2025-08-13'); const e=STORY_EVENTS.find(x=>x.id==='ev_y0_e36'), eh=STORY_EVENTS.find(x=>x.id==='ev_y0_e36h'), en=STORY_EVENTS.find(x=>x.id==='ev_y0_e36n');
  check('0. E36 三個事件都在、8/13 是週三',!!e&&!!eh&&!!en&&CALENDAR.dateOf(D).wd===3); if(!e||!eh||!en){ console.log('FAILED '+fails); process.exit(1); }
  fresh(D,9.5,'campus'); atHome(); run(9.5,9.9); check('1. 10:00 以前沒有',!PHONE.sent(G,'y0_e36_ask'));
  run(10,10.1); check('1. 10:00 還沒看到榜單：可昕還沒傳',!PHONE.sent(G,'y0_e36_ask'));
  check('1. coreCallAt：8/13 09:00 睡著＝10:00 醒來看榜單',(()=>{ const h0=G.hour; G.hour=9; const r=STORY.coreCallAt(G); G.hour=h0; return r===10; })());
  said=[]; menus=[]; script=[]; await loop(); const L0=said.map(x=>x.t);
  check('1. 在家：先三句系統旁白「（八月十三日，早上十點。榜單公布了。）」「（臺大法律學系，財經法學組。你的名字在上面。）」「（分數只比那一組的錄取分數高 0.1。）」（AA_224 6-6）',L0[0]==='（八月十三日，早上十點。榜單公布了。）'&&L0[1]==='（臺大法律學系，財經法學組。你的名字在上面。）'&&L0[2]==='（分數只比那一組的錄取分數高 0.1。）'&&G.flags.E36_RESULT===true,JSON.stringify(L0.slice(0,3)));
  const K=TH('p:kexin').map(m=>m.text), q=OUT.get(G,'y0_e36');
  check('1. 10:00 可昕「看到了。」「晚上八點，椰林大道。這句恭喜，我想當面說。」；出發選單「椰林大道 20:00」（goto 校園）',K.includes('看到了。')&&K.includes('晚上八點，椰林大道。這句恭喜，我想當面說。')&&q&&q.goto.zone==='campus'&&q.h===20&&G.flags.E36_ASKED,JSON.stringify(K));
  const snap=JSON.stringify(G); const back=()=>{ G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); };
  // 2. 從家裡出發 → 椰林大道 3D
  G.hour=19.3; menus=[]; script=['椰林大道']; await loop();
  check('2. 19:15 起家裡的選單有「出發：椰林大道 20:00」；出發＝30 分鐘，19:55 到校園',(menus[0]||[]).some(t=>t.includes('椰林大道 20:00'))&&G.zone==='campus'&&!HOME.at(G)&&Math.abs(G.hour-(20-1/12))<1e-6,JSON.stringify(menus[0])+' '+G.hour);
  spawned=[]; GM.npc={}; run(G.hour,G.hour); check('2. 19:45～20:30 可昕在椰林大道的長椅旁',spawned.some(s=>s[0]==='kexin'&&s[1]===STORY.E36_AT.x&&s[2]===STORY.E36_AT.z));
  check('2. 走到她旁邊：演（在家的版本不演）',EVENTS.check(e)&&!EVENTS.check(eh)); G.zone='gongguan'; check('2. 不在校園：不演',!EVENTS.check(e)); G.zone='campus';
  G.flags.KX_CAR='only_me'; said=[];   /* AA_224 1-6：E36 改讀 KX_CAR */ script=['陪她走','每週一天']; await EVENTS.run(e); await new Promise(r=>setTimeout(r,20)); let L=said.map(x=>x.t);
  const i1=L.indexOf('……我差一點點。真的只差一點點。'), i2=L.indexOf('好，消化完了。');
  check('3. 「台大法律。恭喜你。真的。」祐廷「只高 0.1。」「上了就是上了。」（AA_224 6-6）「我是政大法律。」「……我差一點點。真的只差一點點。」「政大也很好啦。我只是要消化一下。」（BB_179 段 D #68）→（only_me）「你那天說，你以為只有你。……」「不是只有妳。」→「好，消化完了。」',L[0]==='台大法律。恭喜你。真的。'&&L[1]==='只高 0.1。'&&L[2]==='上了就是上了。'&&L[3]==='我是政大法律。'&&i1>=0&&L[i1+1]==='政大也很好啦。我只是要消化一下。'&&L[i1+2]==='你那天說，你以為只有你。……我現在懂那個感覺了。'&&L[i1+3]==='不是只有妳。'&&i2===i1+4&&!L.some(t=>/手機螢幕還亮著榜單/.test(t)),JSON.stringify(L));
  check('3. 沒有重考期的讀書日／玩樂日紀錄（一樣多）：E29 的旁白不說',!L.includes('這半年，你幾乎每天都在念書。')&&!L.some(t=>/河堤，比讀過的書還多/.test(t)));
  { const s3=JSON.stringify(G); for(const [k,n,want] of [['study',3,'這半年，你幾乎每天都在念書。'],['play',2,'這半年，你們很常騎去河堤。']]){ G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); G.day=D-40; for(let i=0;i<n;i++){ G.day=D-40+i; EVENTS.habit('retake:'+k); } G.day=D; G.zone='campus'; G.hour=20; said=[]; script=[0,0]; await EVENTS.run(e); const LL=said.map(x=>x.t);
      check('3. 重考期 '+k+' 比較多：椰林大道開頭、可昕第一句之前說「'+want.slice(0,10)+'……」',LL.indexOf(want)>=0&&LL.indexOf(want)<LL.indexOf('台大法律。恭喜你。真的。'),JSON.stringify(LL.slice(0,3))); } G=JSON.parse(s3); SOCIAL.bind(G); EVENTS.bind(GM); }
  check('3. 陪她走＝「……你這樣很犯規。」「她走慢了一點。」、E36_REPLY silent；每週一天＝「……好。每週一天。」「是哪一天，等我們都摸熟自己的課表再說。不准忘記。」、E36_PACT weekly；「走吧。趁我們還在同一個學校。」',
    L.includes('……你這樣很犯規。')&&L.includes('她走慢了一點。')&&G.flags.E36_REPLY==='silent'&&L.includes('是哪一天，等我們都摸熟自己的課表再說。不准忘記。')&&G.flags.E36_PACT==='weekly'&&L.includes('走吧。品妤揪了十點公館宵夜，大家都會去。'));
  check('3. 接著 22:00 放榜的宵夜（AA_106 3b①）：「八月放榜那晚，公館的宵夜攤坐滿了經濟系的人。」…阿勳「九月開始，你們又是大一了。」韋綸加點（BB_179 段 D E36n）「你們一直吃到攤子收攤。」；演完 23:30',L.includes('八月放榜那晚，公館的宵夜攤坐滿了經濟系的人。')&&L.includes('九月開始，你們又是大一了。')&&!L.includes('今天談。')&&L[L.length-1]==='你們一直吃到攤子收攤。'&&Math.abs(G.hour-23.5)<1e-6,G.hour);
  run(23.5,23.6); const P=grp(); check('3. 23:30「走啦」群組：品妤 📷 宵夜攤＋「放榜紀念。」、韋綸「這張我要設成桌布。」、阿勳「……我眨眼了。」',P.includes('📷（宵夜攤，大家擠在一張桌子）')&&P.includes('放榜紀念。')&&P.includes('這張我要設成桌布。')&&P.includes('……我眨眼了。'),JSON.stringify(P));
  check('3. 一次',!EVENTS.check(e)&&!EVENTS.check(eh));
  // 4. 沒出門、在家：20:30 帶到場
  back(); G.hour=20; said=[]; script=['在家讀書','照樣','四年後','到時候']; await loop(); L=said.map(x=>x.t);
  check('4. 在家讀書到 22:00 → 20:30 以後的那一輪：帶到場（旁白「（你到椰林大道的時候，她坐在路邊的椅子上，手機螢幕還亮著榜單。）」）→ 原文；compete、later',L.includes('（你到椰林大道的時候，她坐在路邊的椅子上，手機螢幕還亮著榜單。）')&&L.includes('好。輸的人，請一年的宵夜。')&&G.flags.E36_REPLY==='compete'&&G.flags.E36_PACT==='later'&&L.includes('……你說的喔。')&&L.includes('你們一直吃到攤子收攤。'),JSON.stringify(L));
  // 5. 在家先睡：20:30 手機震醒 → 帶到場
  back(); G.hour=19; said=[]; script=['睡覺','照樣','陪妳爬','妳想怎麼做']; await loop(); L=said.map(x=>x.t);
  check('5. 19:00 在家睡覺 → 20:30 被叫醒（同一天）→ 帶到場；climb、ask「我想每次見面，都不是因為剛好。」',G.day===D&&L.includes('（你到椰林大道的時候，她坐在路邊的椅子上，手機螢幕還亮著榜單。）')&&L.includes('你是台大的。……好。週末的話可以。')&&G.flags.E36_REPLY==='climb'&&G.flags.E36_PACT==='ask'&&L.includes('我不想每次都看誰剛好有空才見。'),JSON.stringify(L)+' '+G.day+' '+G.hour);
  check('5. coreCallAt：8/13 19:00＝20:30',(()=>{ back(); G.hour=19; return STORY.coreCallAt(G)===20.5; })());
  // 6. 法律系不受影響
  fresh(termDay('Y1S1',4,3),10.5,'dorm'); G.stage='law'; run(10,11); check('6. 法律系的存檔：沒有 E36',!PHONE.sent(G,'y0_e36_ask')&&!G.flags.E36_ASKED);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
