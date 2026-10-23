// 交接包 v2（BB_96 3-1）：芷若 Z3「妳自己喝什麼」＋之後點餐「也幫芷若點一杯」——不需要瀏覽器。修改前沒有 ev_zhiruo_own_drink（第 1 項失敗）。
// 檢查：條件（大一下第 3 週起的平日 21:40～22:00、Café、有點熟以上、只一次、比點餐優先）；店裡只剩祐廷（21:40 前進來的客人 21:40 起身離開、21:40～22:00 不生成、
//   還有客人或跟著你的人時不開始）；台詞逐字、沒有選項、「你是——」不說完、表情順序；ASKED_HER_DRINK；遊戲任何地方不提示她喝什麼（人物資料、記憶名稱與備註、手機筆記）；
//   點餐的「也幫芷若點一杯」：點對（熱可可＋加濃縮）→「……你記得。」＋REMEMBERED_HER、之後不再問；點錯→她笑出來、不扣分、下次還能再點
// 用法：node tests/v2_bb96_z3_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
/* populate（進 Café 時生成的人）用的替身：只記位置、until、離開中 */
global.CHAR={setExpr(){},build:()=>({position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0}})};
const cafeStubs=()=>{ E.zone={roomAt:()=>null,seats:Array.from({length:8},(_,i)=>({x:-3+i,z:1,yaw:0})),spawn:{x:0,z:5}}; E.q={level:'medium'};
  E.addNPC=n=>{ E.npcs.push(n); return n; };
  GM.spawnNPC=(key,spec,x,z,o)=>{ const n={key,obj:{position:{x,y:0,z}},seat:o&&o.seat}; GM.npc[key]=n; return n; };
  GM.spawnCharacter=(id,x,z,o)=>{ const n={charId:id,obj:{position:{x,y:0,z}},seat:o&&o.seat}; GM.npc[id]=n; return n; };
  GM.spawnExtra=()=>{}; GM.spawnRider=()=>{}; };
const customers=()=>Object.keys(GM.npc).filter(k=>k!=='heroine_02').concat(E.npcs.filter(n=>n.isExtra&&!n.clerk).map(()=>'extra'));
const untilOf=()=>Object.keys(GM.npc).filter(k=>k!=='heroine_02').map(k=>GM.npc[k].until).concat(E.npcs.filter(n=>n.isExtra&&!n.clerk).map(n=>n.until));
let spent=0; GM.money=d=>{ spent-=d; };   /* 付錢（consequences.money）走 GM.money */
(async()=>{
  const z3=ev('ev_zhiruo_own_drink'), bar=ev('ev_cafe_barista_zhiruo');
  check('1. Z3「妳自己喝什麼」事件在（ev_zhiruo_own_drink）',!!z3&&!!bar);
  if(!z3||!bar){ console.log('FAILED '+fails); process.exit(1); }
  const W3=termDay('Y1S2',3,1), SHUT=21+40/60;
  const at=(day,hour,fam,flags)=>{ fresh(day,hour,'cafe',Object.assign({afternoonDone:true},flags||{})); R('heroine_02',fam==null?30:fam,10,5); };
  /* 條件 */
  at(W3,21.75); check('2. 大一下第 3 週週一 21:45、Café、有點熟：可以開始',EVENTS.check(z3),SOCIAL.stage('heroine_02'));
  at(W3-7,21.75); check('2. 第 2 週：還不行',!EVENTS.check(z3));
  at(termDay('Y1S1',10,1),21.75); check('2. 大一上：不行',!EVENTS.check(z3));
  at(W3,21.6); check('2. 21:36（21:40 前）：不行',!EVENTS.check(z3));
  at(W3,22.0); check('2. 22:00（她下班）：不行',!EVENTS.check(z3));
  at(W3+5,21.75); check('2. 週六：不行（平日晚班）',!EVENTS.check(z3),'weekday '+G.weekday);
  at(W3+4,21.75); check('2. 週五：可以',EVENTS.check(z3),'weekday '+G.weekday);
  at(W3,21.75,12); check('2. 只是認識（不到有點熟）：不行',!EVENTS.check(z3),SOCIAL.stage('heroine_02'));
  at(termDay('Y2S1',3,1)||W3+200,21.75); check('2. 大二：不可以（AA_207 #4、AA_313 6-5 第 6 點：「我在這裡兩年」只在大一，term Y1S1、Y1S2；原本「大二也可以」）',!EVENTS.check(z3));
  at(W3,21.75); GM.npc.sis={obj:{position:{x:0,y:0,z:0}}}; check('3. 還有客人沒走（學姊）：不開始',!EVENTS.check(z3));
  GM.npc.sis.leaving=true; check('3. 客人已經在走出去：可以開始',EVENTS.check(z3));
  E.npcs.push({isExtra:true,obj:{position:{x:0,y:0,z:0}}}); check('3. 路人客人還坐著：不開始',!EVENTS.check(z3));
  E.npcs[0].leaving=true; E.npcs.push({isExtra:true,clerk:true}); check('3. 吧檯另一位店員（員工）不算客人',EVENTS.check(z3));
  at(W3,21.75,null,{companion:'an'}); check('3. 有人跟著你（同行）：不開始',!EVENTS.check(z3));
  at(W3,21.75); GM.npc.heroine_02={charId:'heroine_02',staff:'cafe',obj:{position:{x:0,y:0,z:0}}}; GM.npc.pool_x={charId:'pool_x',obj:{position:{x:0,y:0,z:0}}}; check('3. 不熟同學還在讀書：不開始（芷若自己不算）',!EVENTS.check(z3));
  /* 店裡只剩祐廷：進 Café 時（populate） */
  cafeStubs(); at(W3,SHUT+0.05); cafeStubs(); STORY.populate('cafe',GM);
  check('4. Z3 那天 21:43 進 Café：沒有客人（學姊、座位的路人、讀書的同學都不生成）',customers().length===0,JSON.stringify(customers()));
  check('4. 芷若照常在吧檯（晚班到 22:00）',!!GM.npc.heroine_02,Object.keys(GM.npc).join(','));
  at(W3,20.5); cafeStubs(); STORY.populate('cafe',GM); const u=untilOf();
  check('4. Z3 那天 20:30 進 Café：客人照常在，但 21:40 會起身離開（until＝21:40）',u.length>=2&&u.every(x=>Math.abs(x-SHUT)<1e-6),JSON.stringify({c:customers(),u}));
  { /* 21:40 到了：客人起身走到門口才離開（refreshSchedule；路人也一樣），不在眼前消失 */
    E.interactables=[{exit:{to:'wenzhou'},x:0,z:6.6,lv:0}]; E.moveTo=(n,x,z,cb)=>{ n._to=[x,z]; n._cb=cb; return true; };
    GM.standUp=n=>{ n.seat=null; }; GM.removeNPC=id=>{ const n=GM.npc[id]; if(n) E.npcs=E.npcs.filter(m=>m!==n); delete GM.npc[id]; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
    G.hour=21.6; STORY.refreshSchedule(GM); const still=customers().length;
    G.hour=SHUT+0.01; STORY.refreshSchedule(GM);
    const cs=Object.keys(GM.npc).filter(k=>k!=='heroine_02').map(k=>GM.npc[k]).concat(E.npcs.filter(n=>n.isExtra&&!n.clerk));
    check('4. 21:36 客人還在；21:40 起身往門口走（學姊、讀書的人、座位的路人都是：leaving、走向出口）',still>=3&&cs.length===still&&cs.every(n=>n.leaving&&n._to&&n._to[1]===6.6),JSON.stringify({still,leaving:cs.map(n=>!!n.leaving)}));
    check('4. 走到門口之前不消失；21:40 的那一刻芷若的事件要等他們都在離開（S.cafeOthers 為空）',customers().length===still&&STORY.cafeOthers(GM).length===0,JSON.stringify(STORY.cafeOthers(GM)));
    for(const n of cs){ n.arrived=true; } G.hour=SHUT+0.05; STORY.refreshSchedule(GM);
    check('4. 走到門口：離開（店裡只剩祐廷，吧檯的芷若、店員還在）',customers().length===0&&!!GM.npc.heroine_02,JSON.stringify(customers())); }
  at(W3+5,21.75); cafeStubs(); STORY.populate('cafe',GM);
  check('4. 週六（沒有 Z3）21:45：客人照常（座位的路人在）；學姊照作息週六晚上不在 Café（AA_284 1-2）',!GM.npc.sis&&E.npcs.some(n=>n.isExtra&&!n.clerk),JSON.stringify(customers()));
  at(W3,20.5); G.events.done.ev_zhiruo_own_drink=1; cafeStubs(); STORY.populate('cafe',GM);
  check('4. Z3 已經發生：之後的平日照常（學姊照作息待到 22:00、路人沒有 until）',GM.npc.sis&&GM.npc.sis.until===22&&E.npcs.filter(n=>n.isExtra&&!n.clerk).every(n=>n.until==null),JSON.stringify(untilOf()));
  at(W3,22.2); cafeStubs(); STORY.populate('cafe',GM);
  check('4. Z3 還沒發生、22:10 以後：客人照常（只有 21:40～22:00 不生成）；學姊作息到 22:00，不在',!GM.npc.sis&&E.npcs.some(n=>n.isExtra&&!n.clerk),JSON.stringify(customers()));
  /* 台詞 */
  at(W3,21.75); await EVENTS.run(z3); const L=lines();
  const WANT=['（她在擦吧檯。機器已經關了。）','林芷若：最後一杯了喔。老樣子？','祐廷：……妳自己都喝什麼？','（她擦吧檯的手停住了。）','林芷若：……（很久）我在這裡兩年。','林芷若：你是——','（她停住，搖頭，笑了一下。）','林芷若：熱可可。加一份濃縮。','林芷若：很怪吧。','林芷若：加一點苦的，比較不會那麼甜。','林芷若：……不要笑。'];   /* AA_207 §5（BB_167 SC3 第 34 列）：原本「很幼稚吧。小孩子的飲料加大人的東西。」 */
  const norm=s=>s.replace(/^[^：]*芷若：/,'林芷若：').replace(/^(我|祐廷|player)：/,'祐廷：');
  check('5. 台詞逐字、順序照 BB_96 3-1',JSON.stringify(L.map(norm))===JSON.stringify(WANT),JSON.stringify(L));
  check('5. 沒有選項（問出那一句就是選擇）',opts.length===0,JSON.stringify(opts));
  const k=z3.dialogue.findIndex(l=>l.text==='你是——'); check('5. 「你是——」不說完：那一句就停、下一句是她搖頭（沒有「第一個問我的人」）',k>0&&z3.dialogue[k+1].speaker===null&&!/第一個/.test(JSON.stringify(z3)),String(k));
  const ex=z3.dialogue.filter(l=>l.speaker==='heroine_02').map(l=>l.expression); check('5. 表情：問了以後 surprised → neutral → embarrassed → smile',JSON.stringify(ex.slice(1))==='["surprised","neutral","neutral","embarrassed","smile","smile"]',JSON.stringify(ex));
  check('6. 記憶 ASKED_HER_DRINK',SOCIAL.has('heroine_02','ASKED_HER_DRINK'));
  check('6. 只一次：發生過就不再開始',!EVENTS.check(z3));
  /* 遊戲任何地方都不提示她喝什麼 */
  const drink=/可可|濃縮/; const memNote=(SOCIAL.memories('heroine_02').find(m=>m.tag==='ASKED_HER_DRINK')||{}).note||'';
  check('7. 記憶名稱、備註不寫她喝什麼',!!SOCIAL.MEMORY_LABEL.ASKED_HER_DRINK&&!drink.test(SOCIAL.MEMORY_LABEL.ASKED_HER_DRINK)&&!drink.test(memNote)&&!!SOCIAL.MEMORY_LABEL.REMEMBERED_HER&&!drink.test(SOCIAL.MEMORY_LABEL.REMEMBERED_HER),JSON.stringify({l:SOCIAL.MEMORY_LABEL.ASKED_HER_DRINK,memNote,r:SOCIAL.MEMORY_LABEL.REMEMBERED_HER}));
  check('7. 人物資料（CHARACTERS.heroine_02）不寫',!drink.test(JSON.stringify(CHARACTERS.heroine_02)));
  check('7. 人物面板（SOCIAL.describe）不寫',!drink.test(SOCIAL.describe('heroine_02')),SOCIAL.describe('heroine_02'));
  { const src=fs.readFileSync(path.join(ROOT,'src/data/events.js'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'').split('\n').filter(l=>!/^\s*\/\//.test(l)).join('\n');
    const hits=(src.match(/[^'"]*(可可|濃縮)[^'"]*/g)||[]); const ok=hits.every(h=>['熱可可。加一份濃縮。','很幼稚吧。小孩子的飲料加大人的東西。','熱可可','加一份濃縮'].includes(h));
    check('7. 事件資料裡「可可／濃縮」只出現在 Z3 那句台詞和點餐的選項（沒有 memo、備註、提示）',ok,JSON.stringify(hits)); }
  { const notes=[]; const memo0=GM.memo; GM.memo=t=>notes.push(t); at(W3,21.75); await EVENTS.run(z3); GM.memo=memo0; check('7. 手機筆記（memo）不寫',!notes.some(t=>drink.test(t)),JSON.stringify(notes)); }
  /* 比點餐優先 */
  at(W3,21.75); G.flags.CAFE_VISITS=6; G.flags.zhiruoFirstOrder='拿鐵'; GM.npc.heroine_02={charId:'heroine_02',staff:'cafe',obj:{position:{x:0,y:0,z:0}}};
  check('8. 21:45 和她說話：先是 Z3（比點餐優先）',EVENTS.check(z3)&&EVENTS.check(bar)&&(z3.priority||0)>(bar.priority||0),JSON.stringify([z3.priority,bar.priority]));
  /* 之後的點餐：也幫芷若點一杯 */
  const order=async(pk,money0)=>{ at(W3+1,15); G.flags.CAFE_VISITS=6; G.flags.zhiruoFirstOrder='拿鐵'; G.money=money0||5000; picks=pk.slice(); await EVENTS.run(bar); return {L:lines(),opts:opts.slice(),money:G.money}; };
  let r=await order([]); check('9. 還沒問過她（沒有 ASKED_HER_DRINK）：點餐沒有「也幫芷若點一杯」',!r.opts.some(o=>o.includes('也幫芷若點一杯')),JSON.stringify(r.opts));
  const setAsked=()=>{ SOCIAL.remember('heroine_02','ASKED_HER_DRINK','x'); };
  { at(W3+1,15); setAsked(); G.flags.CAFE_VISITS=6; G.flags.zhiruoFirstOrder='拿鐵'; picks=['也幫芷若點一杯','熱可可','加一份濃縮']; spent=0; await EVENTS.run(bar); const L2=lines();
    check('9. 問過以後：點完自己的，多一個「也幫芷若點一杯」→ 飲料四選一（拿鐵／美式／熱可可／紅茶）→ 要不要加一份濃縮',JSON.stringify(opts.slice(0,3))===JSON.stringify([['也幫芷若點一杯','（就這樣）'],['拿鐵','美式','熱可可','紅茶'],['加一份濃縮','不加']]),JSON.stringify(opts));
    check('9. 點對（熱可可＋加濃縮）：「她把杯子放下，很久以後說：」「……你記得。」',L2.join('|').includes('她把杯子放下，很久以後說：|林芷若：……你記得。'),JSON.stringify(L2));
    check('9. 點對：記憶 REMEMBERED_HER、自己的拿鐵＋她那杯都要付錢',SOCIAL.has('heroine_02','REMEMBERED_HER')&&spent===240,String(spent));
    const order2=await (async()=>{ G.events.last.ev_cafe_barista_zhiruo=-9; G.day+=1; said=[]; opts=[]; picks=[]; await EVENTS.run(bar); return opts.slice(); })();
    check('9. 點對以後：不再問（「你記得」只有一次）',!order2.some(o=>o.includes('也幫芷若點一杯')),JSON.stringify(order2)); }
  const relBase=await (async()=>{ at(W3+1,15); setAsked(); G.flags.CAFE_VISITS=6; G.flags.zhiruoFirstOrder='拿鐵'; picks=['（就這樣）']; await EVENTS.run(bar); return JSON.stringify(SOCIAL.rel('heroine_02')); })();   /* 只點自己的那一杯（好感照平常）*/
  for(const [pk,label] of [[['也幫芷若點一杯','熱可可','不加'],'熱可可、不加'],[['也幫芷若點一杯','拿鐵','加一份濃縮'],'拿鐵加濃縮'],[['也幫芷若點一杯','紅茶','不加'],'紅茶']]){
    at(W3+1,15); setAsked(); G.flags.CAFE_VISITS=6; G.flags.zhiruoFirstOrder='拿鐵'; picks=pk.slice(); spent=0; await EVENTS.run(bar); const L3=lines();
    check('10. 點錯（'+label+'）：她笑出來「我不喝這個啦。」「……算了，謝謝。我喝。」（AA_207 §5／BB_167 SC3 第 34 列）、不扣分、沒有 REMEMBERED_HER',L3.join('|').includes('她笑出來：|林芷若：我不喝這個啦。|林芷若：……算了，謝謝。我喝。')&&!SOCIAL.has('heroine_02','REMEMBERED_HER')&&JSON.stringify(SOCIAL.rel('heroine_02'))===relBase&&spent===240,JSON.stringify({L3,spent,rel:SOCIAL.rel('heroine_02'),relBase})); }
  { at(W3+1,15); setAsked(); G.flags.CAFE_VISITS=6; G.flags.zhiruoFirstOrder='拿鐵'; picks=['（就這樣）']; spent=0; await EVENTS.run(bar); const L4=lines();
    check('10. 「（就這樣）」：只付自己的、沒有她那杯的台詞，照常「杯子放著就好，慢慢來。」',spent===120&&!L4.some(l=>/你記得|我不喝這個啦/.test(l))&&L4[L4.length-1].includes('杯子放著就好，慢慢來。'),JSON.stringify({spent,L4})); }
  { at(W3+1,15); setAsked(); G.flags.CAFE_VISITS=0; picks=['手沖','也幫芷若點一杯','熱可可','加一份濃縮']; await EVENTS.run(bar);
    check('10. 前幾次（自己選飲料）也一樣：點完自己的才問',opts.length>=2&&opts[1][0]==='也幫芷若點一杯'&&SOCIAL.has('heroine_02','REMEMBERED_HER'),JSON.stringify(opts)); }
  { at(W3+1,15); setAsked(); G.flags.CAFE_VISITS=0; picks=['只是看看']; await EVENTS.run(bar); check('10. 「只是看看」（沒點東西）：不問',!opts.some(o=>o.includes('也幫芷若點一杯')),JSON.stringify(opts)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
