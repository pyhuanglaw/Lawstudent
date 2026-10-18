// 經濟系路線的法律系迎新宿營（CAMP-L1；AA_205 2-3、BB_177 第 14 節）——不需要瀏覽器。8/15 群組與 8/21 名單、8/22 08:00 叫醒／直接出發（沒有「不去」）、三天演完回到 8/24 下午的家（還是經濟系）、交往中 8/23 可昕三則＋8/24「到了」、沒交往沒有、法律系新遊戲不受影響。用法：node tests/camp_econ_unit.js
// 修改前（沒有 camp_y1.js、沒有 STORY.campY1）全部 FAIL。用法：node tests/camp_y1_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|CAMP_Y1_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|ACTIVITIES|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/activities.js','src/data/characters.js','src/data/events.js','src/data/camp_y1.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js']) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},setBg(){},hide(){},slots:{}}; global.CHAR={setExpr(){}};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let G=null, sayHr={}, said=[], cards=[], picks=[], entered=[];
const P={busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0};
const GM={get G(){ return G; },E:{q:{level:'medium'},player:P,zone:{roomAt:()=>null,seats:[]},npcs:[],extras:[],interactables:[{deskStudy:true,seat:{x:1.8,z:-1.9,yaw:Math.PI}}],levels:null,setWeather(){},endCinematic(){},cam:{distTarget:0}},D:{active:false,busyDepth:0},npc:{},
  advance(h){ G.hour+=h; },sitAt(p,seat){ GM.sat=seat; },standUp(){ GM.stood=true; },rel(id,n){ GM.rels=(GM.rels||[]).concat([[id,n]]); },
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){ GM.saves=(GM.saves|0)+1; },energy(){},money(){},setGoal(g){ G.goal=g; },toast(){},updateHUD(){},letterbox(){},fade:()=>Promise.resolve(),
  titleCard:async(a,b)=>{ cards.push(a+'｜'+(b||'')); },
  say:async(who,t)=>{ said.push(typeof who==='string'?who+'：'+t:(who&&who.name?who.name+'：'+t:t)); if(G&&/晚會是學長姐的場子|這關很簡單|十二點半，遊覽車停在校門口/.test(t)) sayHr[t.slice(0,6)]=G.hour; },
  choose:async opts=>{ if(GM.prefer){ const k=opts.findIndex(o=>GM.prefer.some(w=>o.t.indexOf(w)>=0)); if(k>=0) return k; } const want=picks.shift(); if(want==null) return 0; const k=opts.findIndex(o=>o.t.indexOf(want)>=0); return k<0?0:k; },
  enter:async(z,sp)=>{ entered.push(z); G.zone=z; },
  spawnNPC(id,spec,x,z,o){ GM.spawnLog=(GM.spawnLog||[]).concat([[id,o&&o.seat]]); return null; },spawnCharacter(id,x,z,o){ GM.spawnLog=(GM.spawnLog||[]).concat([[id,o&&o.seat]]); return null; }};   /* 只記下來、回傳 null（不放進 GM.npc，事件照舊當作人物沒生出來；後面的段落不受影響）*/
const fresh=()=>{ G={day:1,weekday:3,hour:21.2,zone:'dorm',stage:'law',name:'祐廷',money:22000,flags:{},choices:{},events:{done:{},last:{},count:0},rel:{},social:null,msgs:[],goal:''};
  SOCIAL.bind(G); EVENTS.bind(GM); if(INV.bind) INV.bind(G); said=[]; sayHr={}; cards=[]; picks=[]; entered=[]; GM.saves=0; };
const flush=()=>new Promise(r=>setTimeout(r,10));
const run=()=>{ STORY.phoneRules(GM); PHONE.tick(G); };
const econ=(day,hour,flags)=>{ fresh(); G.stage='econ'; G.day=day; G.hour=hour; G.weekday=CALENDAR.dateOf(day).wd%7; Object.assign(G.flags,{Y0_LEFT:true,Y0_MOVED_OUT:true,LEAVE_WEEK:6},flags||{}); };
(async()=>{
  const d0=STORY.dayOfKey('2025-08-22'); check('0. STORY.CAMP_DAY＝2025-08-22、8/22 是週五',STORY.CAMP_DAY==='2025-08-22'&&CALENDAR.dateOf(d0).wd===5);
  // A 群組與出發選單
  econ(d0-7,19.9,{dating_kexin:true}); run(); check('A. 8/15 20:00 以前：還沒進系學會群組、沒有宿營的出發',!PHONE.inGroup(G,'law_new')&&!OUT.get(G,'y1_camp'));
  G.hour=20.1; run(); const q=OUT.get(G,'y1_camp');
  check('A. 8/15 20:00：進「法律系 114 新生（系學會）」、看到 8/15 公告；排好 8/22 08:30 校門的出發（camp、must）',PHONE.inGroup(G,'law_new')&&PHONE.thread(G,'g:law_new').some(m=>/迎新宿營 8\/22/.test(m.text))&&!!q&&q.day===d0&&q.h===8.5&&q.camp&&q.must,JSON.stringify(q));
  G.day=d0-1; G.hour=21.2; run(); check('A. 8/21 21:00 小隊名單',PHONE.thread(G,'g:law_new').some(m=>/小隊名單｜第七小隊/.test(m.text)));
  // B 叫醒、直接出發
  G.day=d0; G.weekday=5; G.hour=6; check('B. 8/22 睡著：08:00 叫醒（coreCallAt）',STORY.coreCallAt(G)===8,String(STORY.coreCallAt(G)));
  G.hour=7.9; check('B. 07:54 還不直接出發（家裡選單照常，有「出發：校門 08:30」）',!STORY.homeCall(G)&&OUT.due(G)===q,JSON.stringify(OUT.due(G)));
  G.hour=8; const c=STORY.homeCall(G); check('B. 08:00 還在家：直接出發（沒有電話那一句）',!!c&&c.q===q&&!c.line);
  // C 出發選單只有「出發」
  { let seen=null; const ch0=GM.choose; GM.choose=async o=>{ seen=o.map(x=>x.t); return 0; }; const go0=OUT.go; OUT.go=async()=>true; await OUT.prompt(GM,q); OUT.go=go0; GM.choose=ch0;
    check('C. 在 3D 裡到時間的出發選單：只有「出發」（沒有晚一點、不去了）',seen&&seen.length===1&&/^出發：校門 08:30/.test(seen[0]),JSON.stringify(seen)); }
  // D 整段宿營（交往中）
  q.state='planned'; said=[]; cards=[]; const ok=await OUT.go(GM,q,{fromHome:true}); await flush();
  const P=PHONE.thread(G,'p:kexin');
  check('D. 三天演完：CAMP_Y1、回到 8/24 15:00、還是經濟系（不接 8/29 搬宿舍）、出發標成 done',ok&&G.flags.CAMP_Y1===true&&G.day===d0+2&&Math.abs(G.hour-15)<1e-6&&G.stage==='econ'&&!entered.includes('dorm')&&q.state==='done',JSON.stringify({day:G.day-d0,h:G.hour,stage:G.stage,entered}));
  check('D. 營地旁白：「這個營地你去年來過。」（PLAYED_Y0）',G.flags.PLAYED_Y0===true&&said.some(t=>/這個營地你去年來過/.test(t)));
  check('D. 8/23 可昕三則（22:00）、熄燈前才收到的旁白（BB_177 第 14 節）',['山上冷嗎','訊號不好就不用回','明天十二點半到校門對吧，到了跟我說一聲'].every(x=>P.some(m=>m.text===x&&m.day===d0+1&&Math.abs(m.h-22)<1e-6))&&said.includes('（手機到熄燈前才收到訊息。）'),JSON.stringify(P.map(m=>[m.day-d0,m.h,m.text])));
  check('D. 8/24 12:30 到校門：「到了」傳給可昕＋旁白',P.some(m=>m.text==='到了'&&m.from==='player'&&m.day===d0+2&&Math.abs(m.h-12.5)<1e-6)&&said.includes('（你傳了一句『到了』給可昕。）'));
  check('D. 營地裡不提可昕（宿營 12 段的台詞沒有「可昕」，只有那兩句旁白）',said.filter(t=>/可昕/.test(t)).every(t=>t==='（你傳了一句『到了』給可昕。）'),JSON.stringify(said.filter(t=>/可昕/.test(t))));
  run(); check('D. 演完以後不再排宿營',!STORY.homeCall(G)&&OUT.get(G,'y1_camp').state==='done');
  // E 沒交往：沒有私訊
  econ(d0-7,20.1,{}); run(); const q2=OUT.get(G,'y1_camp'); G.day=d0; G.hour=8; said=[]; await OUT.go(GM,q2,{fromHome:true}); await flush();
  check('E. 沒交往的經濟系玩家：宿營照演、沒有可昕的私訊與旁白',G.flags.CAMP_Y1===true&&!PHONE.thread(G,'p:kexin').some(m=>m.text==='山上冷嗎')&&!said.includes('（手機到熄燈前才收到訊息。）'));
  // F 法律系新遊戲（開場和可昕交往中）不受影響
  fresh(); G.flags.dating_kexin=true; said=[]; await STORY.campY1(GM,{next:false}); await flush();
  check('F. 法律系新遊戲的宿營：沒有經濟系路線的私訊、不設 PLAYED_Y0',G.flags.CAMP_Y1===true&&!PHONE.thread(G,'p:kexin').some(m=>m.text==='山上冷嗎')&&!G.flags.PLAYED_Y0);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
