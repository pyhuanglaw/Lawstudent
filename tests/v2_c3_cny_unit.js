// 交接包 v2 C3：寒假拜年（AA_71 2-8「大一的台詞」；芷若、方奕廷兩則 BB 7451e42 改字）——不需要瀏覽器。修改前沒有 STORY.lunarNewYear、手機沒有這些訊息（第 1 項失敗）。
// 檢查：初一是 2026-02-17；麵店團群組初一 11:00 阿哲、以安的照片＋拜年，回牛肉麵／貼圖的回應（2026-10-14 祐廷改成臺北人，原本是火雞肉飯）；不在群組沒有；芷若有點熟（店休三天）／朋友（……我家的。）／不熟、沒聯絡方式沒有；
//   方奕廷初三 15:00 才到：有點熟（學名＋說明）／朋友（這棵你猜＋隔天答案）；睡過頭（初三才起床）照原本的時間補進去；大一下開學以後不會再送
// 用法：node tests/v2_c3_cny_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
(async()=>{
  check('有 STORY.lunarNewYear',typeof STORY.lunarNewYear==='function');
  if(typeof STORY.lunarNewYear!=='function'){ console.log('FAILED '+fails); process.exit(1); }
  const ny=STORY.lunarNewYear();
  check('大一的春節初一＝2026-02-17（前一天除夕）',ny!=null&&CALENDAR.dateOf(ny).key==='2026-02-17'&&CALENDAR.holiday(ny-1)==='除夕',ny+' '+(ny&&CALENDAR.dateOf(ny).key));
  const setup=(day,hour,o)=>{ o=o||{}; fresh(day,hour,'dorm'); if(o.group!==false) PHONE.join(G,'noodle_team','麵店團'); G.contacts=G.contacts||{}; for(const id in (o.contacts||{})) G.contacts[id]=o.contacts[id];
    for(const id in (o.rel||{})) R(id,...o.rel[id]); };
  /* 麵店團 */
  { setup(ny,8); run(8,12); const L=txt('g:noodle_team').filter(t=>!/建立了/.test(t));
    check('麵店團（初一 11:00）：阿哲「📷（高雄的夜市，人擠人）」「新年快樂！高雄沒有冬天」「你們那邊冷嗎」、以安「📷（台中的老街，一整排紅燈籠）」「新年快樂。人太多，只走到第三個路口就回家了。」',
      JSON.stringify(L.slice(-5))===JSON.stringify(['zhe:📷（高雄的夜市，人擠人）','zhe:新年快樂！高雄沒有冬天','zhe:你們那邊冷嗎','heroine_01:📷（台中的老街，一整排紅燈籠）','heroine_01:新年快樂。人太多，只走到第三個路口就回家了。'])&&TH('g:noodle_team').filter(m=>m.text.includes('高雄')).every(m=>m.day===ny&&Math.abs(m.h-11)<0.01),JSON.stringify(L));
    const m=PHONE.byAsk(G,'cny_noodle_reply');
    check('可以回兩種（牛肉麵的照片／貼圖）；不回就只是沒回',!!m&&JSON.stringify(m.ask.opts.map(o=>o.t))==='["（傳姊姊帶你去吃的牛肉麵）","（傳一張「新年快樂」的貼圖）"]',m&&JSON.stringify(m.ask.opts.map(o=>o.t)));
    PHONE.answer(G,'cny_noodle_reply',0); const A=txt('g:noodle_team').slice(-3);
    check('回牛肉麵：你「📷（姊姊帶你去吃的牛肉麵）」→ 阿哲「牛肉麵！！看起來好好吃」、以安「哪一家？……看起來比麵店的辣。」（AA_313 4-3：不用「記下來了」收尾；AA_524 A13 改原句，不約開學）',JSON.stringify(A)===JSON.stringify(['player:📷（姊姊帶你去吃的牛肉麵）','zhe:牛肉麵！！看起來好好吃','heroine_01:哪一家？……看起來比麵店的辣。']),JSON.stringify(A));
    setup(ny,8); run(8,12); PHONE.answer(G,'cny_noodle_reply',1); const B=txt('g:noodle_team').slice(-2);
    check('回貼圖：你「（貼圖：新年快樂）」→ 阿哲回一張一樣的貼圖',JSON.stringify(B)===JSON.stringify(['player:（貼圖：新年快樂）','zhe:（貼圖：新年快樂）']),JSON.stringify(B));
    setup(ny,8,{group:false}); run(8,12); check('不在麵店團群組：沒有',!TH('g:noodle_team').length);
    setup(ny-1,20); run(20,23.9); G.day=ny; run(0,12); check('除夕晚上開著遊戲過夜：初一 11:00 照樣到、只一次',TH('g:noodle_team').filter(m=>m.text.includes('高雄沒有冬天')).length===1); }
  /* 芷若 */
  { const z=(rel,contact)=>{ setup(ny,8,{rel:{heroine_02:rel},contacts:contact?{heroine_02:ny-30}:{}}); run(8,16); return txt('p:heroine_02'); };
    let L=z([25],true);
    check('芷若（有點熟、有聯絡方式，初一 15:30）：「📷（台中，高中旁邊的影印店，…「初一至初三休息」）」「新年快樂。」「店休三天。」',JSON.stringify(L)===JSON.stringify(['heroine_02:📷（台中，高中旁邊的影印店，鐵門拉下來，貼著紅紙「初一至初三休息」）','heroine_02:新年快樂。','heroine_02:店休三天。'])&&TH('p:heroine_02').every(m=>Math.abs(m.h-15.5)<0.01),JSON.stringify(L));
    L=z([45,30],true); check('芷若（朋友以上）：最後一句「店休三天。……我家的。」',L[L.length-1]==='heroine_02:店休三天。……我家的。',JSON.stringify(L));
    check('芷若：只是認識、沒有聯絡方式都沒有',!z([10],true).length&&!z([25],false).length); }
  /* 方奕廷 */
  { const f=(rel,h1,dayTo)=>{ setup(ny,8,{rel:{npc_fangyt:rel},contacts:{npc_fangyt:ny-30}}); run(8,23.9); for(let d=ny+1;d<=dayTo;d++){ G.day=d; G.weekday=wdOf(d); run(0,d===dayTo?h1:23.9); } return txt('p:npc_fangyt'); };
    let L=f([25],14.9,ny+2); check('方奕廷：初三 15:00 以前沒有（山上沒有訊號）',!L.length,JSON.stringify(L));
    L=f([25],16,ny+2);
    check('方奕廷（有點熟，初三 15:00）：照片＋「新年快樂。初一拍的，山上沒有訊號。」「台灣二葉松，Pinus taiwanensis。針葉兩根一束。」「山上聽不到鞭炮。很好。」',JSON.stringify(L)===JSON.stringify(['npc_fangyt:📷（山上的雲海和一棵松樹）','npc_fangyt:新年快樂。初一拍的，山上沒有訊號。','npc_fangyt:台灣二葉松，Pinus taiwanensis。針葉兩根一束。','npc_fangyt:山上聽不到鞭炮。很好。']),JSON.stringify(L));
    L=f([45,30],16,ny+3);
    check('方奕廷（朋友以上）：「這棵你猜。」（沒有學名）＋隔天「答案：台灣二葉松。針葉兩根一束，名字就是提示。」',JSON.stringify(L)===JSON.stringify(['npc_fangyt:📷（山上的雲海和一棵松樹）','npc_fangyt:新年快樂。初一拍的，山上沒有訊號。','npc_fangyt:這棵你猜。','npc_fangyt:答案：台灣二葉松。針葉兩根一束，名字就是提示。']),JSON.stringify(L)); }
  /* 睡過頭：初三下午才起床（中間的天沒有跑 phoneRules）*/
  { setup(ny+2,16,{rel:{heroine_02:[25],npc_fangyt:[25]},contacts:{heroine_02:ny-30,npc_fangyt:ny-30}}); run(16,16.5);
    const zr=TH('p:heroine_02'), gp=TH('g:noodle_team').filter(m=>m.text.includes('高雄沒有冬天'));
    check('初三才第一次跑：芷若、麵店團照原本的時間（初一）補進去，不會跑到未來',zr.length===3&&zr.every(m=>m.day===ny&&Math.abs(m.h-15.5)<0.05)&&gp.length===1&&gp[0].day===ny,JSON.stringify(zr.map(m=>[m.day,m.h]))); }
  /* 範圍外 */
  { setup(STORY.termDay('Y1S2',3,3),8,{rel:{heroine_02:[25]},contacts:{heroine_02:1}}); run(8,16); check('大一下開學以後：沒有拜年訊息',!txt('g:noodle_team').some(t=>/新年快樂/.test(t))&&!TH('p:heroine_02').length); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });
