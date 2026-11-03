// DORM-DESK-ITEMS-3D-1103（使用者 11-03「不應該還有這些選項? 不然也是在書桌上?? 書桌牆面可以貼東西? 擺書」）——不需要瀏覽器。
// 檢查：STORY.roomItemKeys 和選單 STORY.roomItemList 是同一份（每一個有 3D 的標籤都換成 key、旗標開關跟著變），每一個 key 在 dorm_desk_items.glb 都有 ITEM_desk_<key> 節點（jacket 例外：dorm_room4 的 JACKET_）。
// 用法：node tests/dorm_desk_items_unit.js
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
const D=k=>STORY.dayOfKey(k), Tm=(d,h)=>d*24+h;
let cards=[], entered=[];
GM.titleCard=async(a,b)=>{ cards.push([a,b]); }; GM.enter=async(z)=>{ entered.push(z); G.zone=z; };
GM.money=function(n){ G.money+=n; };
const J=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/dorm_desk_items.json'),'utf8')), NODES=Object.keys(J.pos||{});
const keysOf=()=>STORY.roomItemKeys(G), labels=()=>STORY.roomItemList(G).map(r=>r[0]);
(async()=>{
  const d1=termDay('Y1S1',3,2);
  fresh(d1,20,'dorm'); let K=keysOf();
  check('1. 大一：選單的五件都有 key（舊《民法》、經濟學原理、寫滿的筆記本、桌墊下的票根、手機相簿）',['civil','econ','notebook','ferris','phone'].every(k=>K.includes(k)),JSON.stringify(K));
  check('2. 沒有聖誕節的螢光筆時，三色螢光筆不顯示',!K.includes('highlighters'),JSON.stringify(K));
  fresh(d1,20,'dorm',{XMAS_HL3:true}); K=keysOf(); check('3. XMAS_HL3 → 桌上的三色螢光筆',K.includes('highlighters')&&labels().includes('桌上的三色螢光筆'),JSON.stringify(K));
  fresh(d1,20,'dorm',{KX_TRIP:{Y1S2:'oldtown'}}); K=keysOf(); check('4. 旅行的照片照 KX_TRIP.Y1S2（老街）→ trip_oldtown',K.includes('trip_oldtown')&&!K.includes('trip_sea'),JSON.stringify(K));
  fresh(d1,20,'dorm',{KX_ANNIV:[0,'went']}); K=keysOf(); check('5. 去了週年 → 她的週年卡片',K.includes('anniv')===labels().includes('她的週年卡片')&&K.includes('anniv'),JSON.stringify(K));
  fresh(d1,20,'dorm',{KX_ANNIV:[0,'missed']}); K=keysOf(); check('6. 沒去週年（missed）→ 沒有卡片',!K.includes('anniv'),JSON.stringify(K));
  fresh(d1,20,'dorm'); SOCIAL.remember('heroine_02','WATCHED_FILM',''); K=keysOf(); check('7. 和芷若看過電影 → 一張票根 film1',K.includes('film1')&&!K.includes('film3'),JSON.stringify(K));
  fresh(d1,20,'dorm'); SOCIAL.remember('heroine_02','WATCHED_FILM_GROUP',''); K=keysOf(); check('8. 三個人一起看 → 三張連號 film3',K.includes('film3')&&!K.includes('film1'),JSON.stringify(K));
  fresh(d1,20,'dorm',{ECON_JACKET:'wear'}); K=keysOf(); check('9. 系外套照舊在選單上（key jacket，3D 由 dorm_room4 的 JACKET_ 管）',K.includes('jacket'),JSON.stringify(K));
  { fresh(d1,20,'dorm'); const kai=STORY.kaiRoommate&&STORY.kaiRoommate(G); K=keysOf(); check('10. 阿凱同房 → 阿凱的泡麵評鑑表（選單有＝key 有）',K.includes('kai_sheet')===labels().includes('阿凱的泡麵評鑑表'),JSON.stringify({kai,K})); }
  // 每一個標籤（有 3D 的）都換成 key：選單上看得到、房間裡卻沒有的情形
  { const MAP=['書架上的舊《民法》','經濟學原理','寫滿的筆記本','摩天輪的票根（夾在桌墊下）','手機相簿的一張照片','桌上的三色螢光筆','阿凱的泡麵評鑑表','三張連號的票根','電影票根','她的週年卡片','經濟系的系外套','旅行的照片'];
    fresh(d1,20,'dorm',{XMAS_HL3:true,KX_TRIP:{Y1S2:'sea'},KX_ANNIV:[0,'went'],ECON_JACKET:'wear'}); SOCIAL.remember('heroine_02','WATCHED_FILM','');
    const Ls=labels().filter(l=>MAP.includes(l)); K=keysOf(); check('11. 全開的存檔：每一個有 3D 的選單標籤都有一個 key（標籤 '+Ls.length+'、key '+K.length+'）',Ls.length===K.length,JSON.stringify({Ls,K}));
    const miss=K.filter(k=>k!=='jacket'&&!NODES.includes('ITEM_desk_'+k)); check('12. 每一個 key 在 dorm_desk_items.glb 都有 ITEM_desk_<key>（jacket 例外）',!miss.length,JSON.stringify(miss)); }
  for(const t of ['sea','oldtown','stars']) check('13. 旅行照片三種都有節點：trip_'+t,NODES.includes('ITEM_desk_trip_'+t));
  check('14. 大一的軟木板 ITEM_desk_board 有節點',NODES.includes('ITEM_desk_board'));
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
