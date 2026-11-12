// DORM-DESK-ITEMS-3D-1103（使用者 11-03「不應該還有這些選項? 不然也是在書桌上?? 書桌牆面可以貼東西? 擺書」）——不需要瀏覽器。
// 檢查：STORY.roomItemKeys 和選單 STORY.roomItemList 是同一份（每一個有 3D 的標籤都換成 key、旗標開關跟著變），每一個 key 在 dorm_desk_items.glb 都有 ITEM_desk_<key> 節點（jacket 例外：dorm_room4 的 JACKET_）。
// 用法：node tests/dorm_desk_items_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
  fresh(d1,20,'dorm',{ECON_JACKET:'wear'}); K=keysOf(); check('9. 舊存檔有 ECON_JACKET 也不再有那件外套（CANON-NO-ECON-1112 第三批：這一項拿掉）',!K.includes('jacket'),JSON.stringify(K));
  { fresh(d1,20,'dorm'); const kai=STORY.kaiRoommate&&STORY.kaiRoommate(G); K=keysOf(); check('10. 阿凱同房 → 阿凱的泡麵評鑑表（選單有＝key 有）',K.includes('kai_sheet')===labels().includes('阿凱的泡麵評鑑表'),JSON.stringify({kai,K})); }
  // 每一個標籤（有 3D 的）都換成 key：選單上看得到、房間裡卻沒有的情形
  { const MAP=['書架上的舊《民法》','經濟學原理','寫滿的筆記本','摩天輪的票根（夾在桌墊下）','手機相簿的一張照片','桌上的三色螢光筆','阿凱的泡麵評鑑表','三張連號的票根','電影票根','她的週年卡片','經濟系的系外套','旅行的照片'];
    fresh(d1,20,'dorm',{XMAS_HL3:true,KX_TRIP:{Y1S2:'sea'},KX_ANNIV:[0,'went'],ECON_JACKET:'wear'}); SOCIAL.remember('heroine_02','WATCHED_FILM','');
    const Ls=labels().filter(l=>MAP.includes(l)); K=keysOf(); check('11. 全開的存檔：每一個有 3D 的選單標籤都有一個 key（標籤 '+Ls.length+'、key '+K.length+'）',Ls.length===K.length,JSON.stringify({Ls,K}));
    const miss=K.filter(k=>k!=='jacket'&&!NODES.includes('ITEM_desk_'+k)); check('12. 每一個 key 在 dorm_desk_items.glb 都有 ITEM_desk_<key>（jacket 例外）',!miss.length,JSON.stringify(miss)); }
  for(const t of ['sea','oldtown','stars']) check('13. 旅行照片三種都有節點：trip_'+t,NODES.includes('ITEM_desk_trip_'+t));
  check('14. 大一的軟木板 ITEM_desk_board 有節點',NODES.includes('ITEM_desk_board'));
  // 選了那一項鏡頭轉去看那件東西（BB 11-03 14:03 第 4 點；STORY.roomItemFocus＋GLB 節點 extras 的 eye／look）
  { const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/dorm_desk_items.glb')), jl=b.readUInt32LE(12), gj=JSON.parse(b.slice(20,20+jl).toString('utf8'));
    const ex={}; for(const n of gj.nodes||[]) if(/^ITEM_desk_/.test(n.name||'')) ex[n.name.slice(10)]=n.extras||{};
    const noCam=Object.keys(ex).filter(k=>k!=='board'&&!/^liufa_/.test(k)&&!(Array.isArray(ex[k].eye)&&ex[k].eye.length===3&&Array.isArray(ex[k].look)&&ex[k].look.length===3));
    check('15. 每一件（軟木板、六法以外：不在選單裡）的節點都有鏡頭 eye／look',!noCam.length,JSON.stringify(noCam));
    const far=Object.keys(ex).filter(k=>ex[k].eye&&ex[k].look&&Math.hypot(ex[k].eye[0]-ex[k].look[0],ex[k].eye[1]-ex[k].look[1],ex[k].eye[2]-ex[k].look[2])>1.0);
    check('16. 鏡頭離東西 1 m 以內（第一版 1.1 m：照片、評鑑表太小）',!far.length,JSON.stringify(far));
    const inDeck=Object.keys(ex).filter(k=>ex[k].eye&&ex[k].eye[0]<-0.95&&ex[k].eye[1]>1.55);
    check('17. 鏡頭不在上舖床板裡（x < −0.95 的鏡頭低於 1.55 m）',!inDeck.length,JSON.stringify(inDeck));
    let got=null; const par={visible:true,parent:null,updateMatrixWorld(){},localToWorld:v=>({x:v.x+10,y:v.y,z:v.z})};
    const node={visible:true,parent:par,userData:{eye:[1,2,3],look:[4,5,6]}};
    const GMf={G:{flags:{}},E:{scene:{getObjectByName:n=>n==='ITEM_desk_notebook'?node:null},cinematic:(p,l,v)=>{ got=[p,l,v]; }}};
    const r1=STORY.roomItemFocus(GMf,'寫滿的筆記本');
    check('18. roomItemFocus：選「寫滿的筆記本」→ E.cinematic（GLB 根節點座標換成世界座標）',r1===true&&got&&got[0].x===11&&got[1].x===14&&got[1].z===6,JSON.stringify(got));
    got=null; node.visible=false; const r2=STORY.roomItemFocus(GMf,'寫滿的筆記本');
    check('19. 那件東西沒顯示（別的年份）就不轉鏡頭',r2===false&&got===null);
    got=null; const r3=STORY.roomItemFocus(GMf,'經濟系的系外套');
    check('20. 沒有鏡頭資料的（系外套、沒有節點）不轉鏡頭',r3===false&&got===null);
    // 六法（BB 11-03 16:16 P3 (a)：書桌上的紅色方塊像盒子 → 厚書）：一年一個節點，整本把 dorm_room4 的方塊包住（x −1.92～−1.64、z 0.26～0.52、頂 0.82／大三起 0.85）
    const J=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/dorm_desk_items.json'),'utf8')), bad6=[];
    for(const [room,top] of [['203',0.82],['312',0.82],['507',0.85],['409',0.85]]){ const k='liufa_'+room, b=J.pos&&J.pos['ITEM_desk_'+k];
      if(!ex[k]||ex[k].room!==room||!b||!(b.min[0]<=-1.92&&b.max[0]>=-1.64&&b.min[2]<=0.26&&b.max[2]>=0.52&&b.min[1]<=0.761&&b.max[1]>top)) bad6.push(k+' '+JSON.stringify(b)); }
    check('21. 六法：203／312／507／409 各一本（room 對得上），整本包住 dorm_room4 的紅色方塊',!bad6.length,bad6.join('；'));
    const zsrc=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8');
    check('22. zones3d.js deskItemKeys 照房間加 liufa_<房間>（不在「看東西」選單裡，每一年都顯示）',/K\.push\('liufa_'\+room\)/.test(zsrc));
    // 鏡頭轉過去的路線（P3 (b)：會穿過梯子、床欄）：先到走道上的 via（x ≥ −0.65：祐廷那組的床板、床欄、梯子在 x −2.0～−0.9），和 eye 同高同 z，再平移到 eye
    const noVia=Object.keys(ex).filter(k=>ex[k].eye&&!(Array.isArray(ex[k].via)&&ex[k].via[0]>=-0.65&&Math.abs(ex[k].via[1]-ex[k].eye[1])<1e-6&&Math.abs(ex[k].via[2]-ex[k].eye[2])<1e-6));
    check('23. 每一件有鏡頭的都有 via（走道 x ≥ −0.65、和 eye 同高同 z）',!noVia.length,JSON.stringify(noVia));
    node.visible=true; node.userData.via=[7,2,3]; got=null; STORY.roomItemFocus(GMf,'寫滿的筆記本');
    check('24. roomItemFocus 把 via（換成世界座標）交給 E.cinematic 第三個參數',!!got&&!!got[2]&&got[2].x===17&&got[2].z===3,JSON.stringify(got&&got[2]));
    const esrc=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8');
    check('25. engine3d.js：E.cinematic(pos,look,via)，鏡頭先往 via、到了（15 cm 內）再往 pos',/E\.cinematic=function\(pos,look,via\)/.test(esrc)&&/camera\.position\.lerp\(s\.via\|\|s\.pos/.test(esrc)&&/s\.via=null/.test(esrc)); }
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
