// v0 10/15 群組聚會（AA_154 2-1b，AA-B 3828a4dd）：17:30 群組兩則、出發選單到 19:15、去了的出遊（E10_EVE）、沒去的 21:40 一則——不需要瀏覽器。用法：node tests/v0_gather_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], picks=[], rels=[], G=null; const caps=[];   /* caps：[字幕（場景名、回程的地點字幕）, 出字幕那時候已經說了幾句]（AA_529 第⑤點：字幕和旁白的先後）*/
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0,endCinematic(){}};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(a,b){ caps.push([b,said.length]); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(id,d){ rels.push([id,d]); },walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags,stage)=>{ G={v:3,day,hour,zone,stage:stage||'econ',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); said=[]; picks=[]; rels=[]; };
const run=()=>{ STORY.phoneRules(GM); PHONE.tick(G); };
const at=(day,hour)=>{ G.day=day; G.hour=hour; G.weekday=wdOf(day); run(); };
const TH=th=>PHONE.thread(G,th).map(m=>m.text);
(async()=>{
  const K=k=>STORY.dayOfKey(k), D15=K('2024-10-15'), D16=K('2024-10-16');
  const ev=STORY_EVENTS.find(e=>e.id==='ev_y0_gather'); check('0. ev_y0_gather（出遊）在',!!ev&&ev.trigger==='outing'); if(!ev){ console.log('FAILED '+fails); process.exit(1); }
  fresh(D15-1,18,'campus'); G.events.done.ev_y0_e02=1; run(); check('1. 10/14 沒有揪人',!PHONE.sent(G,'y0_gather_grp'));
  fresh(D15,17,'campus'); G.events.done.ev_y0_e02=1; run(); check('1. 10/15 17:00 還沒有',!PHONE.sent(G,'y0_gather_grp'));
  at(D15,17.6); const g=TH('g:econ_class');
  check('1. 17:30 經濟系群組兩則（韋綸、品妤；BB_179 段 B #26、#27）',g.includes('今晚七點，公館！期中考前最後一次放風。')&&g.includes('我跟同事換了班，可以去。'),JSON.stringify(g));
  const q=OUT.get(G,'y0_gather'); check('1. 出發選單：「公館 19:00：經濟系的聚會」，19:15 以後收起來',!!q&&q.title==='公館 19:00：經濟系的聚會'&&(()=>{ G.hour=19.2; const a=!!OUT.due(G); G.hour=19.3; const b=!OUT.due(G); G.hour=17.6; return a&&b; })());
  const snap=JSON.stringify(G);
  // 去了
  GM.money=d=>{ G.money+=d; }; picks=['假裝沒看到']; said=[]; caps.length=0; const m0=G.money, f0=SOCIAL.rel('kexin').fam||0; G.hour=18.75; await OUT.go(GM,q); const L=said.map(x=>x.t);
  check('2. 去了（BB_179 段 B 改稿、AA_203 #2 #3 六個人）：公館（AA_368 L1：第一句「（公館。下禮拜就是期中考。）」，原本「期中考前的最後一個晚上」）、桌遊錢、「三個小時的話，剛好。」、看你的牌…十點二十散了→ 她留下來（AA_293 第 4 節，KX_STAYED）；不再有「一百五」；AA_529 第 2 節：最後一句是「（回家的路上，手機震了一下。）」（還沒有「走啦」＝這時候建）；AA_529 第⑤點：它排在地點字幕「在公館的路口散了。」後面（先散了，才在回家的路上）',L[0]==='（公館。下禮拜就是期中考。）'&&!L.some(t=>/期中考前的最後一個晚上/.test(t))&&L.includes('今天不准聊期中喔。誰聊到，今晚的桌遊錢他出。')&&L.includes('（六個人擠進一家桌遊店。一個人一小時五十元。）')&&L.includes('（看了一下錢包）三個小時的話，剛好。')&&!L.some(t=>/一百五/.test(t))&&L.includes('（他講的那件事，講到最後還是微積分。）')&&L.includes('（六個人在夜市吃了一圈。十點二十，大家在公館的路口散了。）')&&L.includes('我還不想回去。')&&L[L.length-2]==='（她走進女舍以前，回頭揮了一下手。）'&&L[L.length-1]==='（回家的路上，手機震了一下。）'&&caps.filter(c=>c[0]==='在公館的路口散了。').length===1&&caps.find(c=>c[0]==='在公館的路口散了。')[1]===L.length-1&&G.flags.KX_STAYED===true,JSON.stringify([L.slice(0,3),caps]));
  check('2. 假裝沒看到：「（那一局她贏了。）」「你讓我？……下次不用讓。」',L.includes('（那一局她贏了。）')&&L.includes('你讓我？……下次不用讓。'));
  check('2. 散了以後（AA_303 第 2 節 7）：「我還不想回去。」「……我餓了。剛剛在夜市都在講話。」→ 便利商店門口的小鐵桌、關東煮 →「（沒有人提期中。她把蘿蔔分你一半。）」→ 十一點半、女舍門口；沒有選項、沒有河堤、豆漿',(()=>{ const i=L.indexOf('我還不想回去。'); return i>0&&JSON.stringify(L.slice(i,i+6))===JSON.stringify(['我還不想回去。','……我餓了。剛剛在夜市都在講話。','（巷口的便利商店，門口有一張小鐵桌。她買了關東煮，你買了兩瓶熱的。）','（沒有人提期中。她把蘿蔔分你一半。）','（十一點半，她說：「好，這次真的要回去了。」）','（她走進女舍以前，回頭揮了一下手。）']); })()&&!L.some(t=>/河堤|豆漿/.test(t)),JSON.stringify(L.slice(-6)));
  check('2. 22:20 左右、錢 −100、E10_EVE:went、可昕熟悉度 +1',Math.abs(G.hour-(22+1/3))<0.02&&G.money===m0-100&&G.flags.E10_EVE==='went'&&(SOCIAL.rel('kexin').fam||0)-f0===1,JSON.stringify([G.hour,m0-G.money,G.flags.E10_EVE,(SOCIAL.rel('kexin').fam||0)-f0]));
  at(D15,23.8); check('2. 去了：21:40 那則沒有；可昕的邀約改 23:45（AA_293 第 4 節：她回到宿舍才傳）',!PHONE.sent(G,'y0_gather_miss')&&TH('p:kexin').includes('玩了一整晚。明天去總圖念書吧。期中考快到了。')&&!TH('p:kexin').includes('你今天沒來。我們玩了一整晚。'));
  // 沒去
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); const m1=G.money; at(D15,19.5); check('3. 沒去：19:15 以後出發選單沒有、記成 missed',!OUT.due(G)&&(OUT.expire(G),OUT.get(G,'y0_gather').state==='missed'));
  at(D15,21.8); check('3. 沒去：21:40 群組「唐睿聊到期中了。今天他請。」、錢不變、E10_EVE 不記',TH('g:econ_class').includes('唐睿聊到期中了。今天他請。')&&G.money===m1&&!G.flags.E10_EVE);
  // 存讀檔
  G=JSON.parse(snap); const G2=JSON.parse(JSON.stringify(G)); G=G2; SOCIAL.bind(G); EVENTS.bind(GM); G.hour=18.6; check('4. 17:30～19:00 存讀檔：出發選單還在',!!OUT.due(G));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
